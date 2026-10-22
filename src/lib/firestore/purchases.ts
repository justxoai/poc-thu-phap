import "server-only";

import { createHash } from "node:crypto";

import { BOOK, bookTotal, bookUnitPrice, chooseBookDiscount } from "@/lib/book-pricing";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import { sealSummary, type SealItem } from "@/lib/seal-pricing";
import { normalizeCode } from "@/lib/firestore/students";
import type { BookDiscount, DataResult } from "@/lib/types";
import type { PaymentSettings } from "@/lib/vietqr";
import { FieldValue, type Firestore } from "firebase-admin/firestore";

/** Id xác định từ nội dung đơn (+ khung thời gian) để bấm gửi hai lần không tạo hai bản ghi. */
export function purchaseId(kind: string, parts: string[], bucketMs = 0, now = Date.now()): string {
  const bucket = bucketMs > 0 ? String(Math.floor(now / bucketMs)) : "";
  return createHash("sha256").update([kind, ...parts, bucket].join("\u0001")).digest("hex").slice(0, 28);
}

function isAlreadyExists(error: unknown): boolean {
  const e = error as { code?: unknown; message?: unknown } | null;
  return e?.code === 6 || (typeof e?.message === "string" && e.message.includes("ALREADY_EXISTS"));
}

/** Ghi một lần: nếu đã có (cùng id) thì coi như trùng, không ghi đè. */
async function createOnce(db: Firestore, id: string, data: Record<string, unknown>): Promise<"created" | "duplicate"> {
  try {
    await db.collection("purchases").doc(id).create({ ...data, createdAt: FieldValue.serverTimestamp() });
    return "created";
  } catch (error) {
    if (isAlreadyExists(error)) return "duplicate";
    throw error;
  }
}

export interface BookOrderInput {
  name: string;
  phone: string;
  address: string;
  quantity: number;
  /** Mã ưu đãi đã chuẩn hóa hoặc "". */
  promoCode: string;
}

export interface BookOrderResult {
  discount: BookDiscount;
  unitPrice: number;
  total: number;
  duplicate: boolean;
}

/** Số suất giá "đăng ký sớm": `settings/bookSale.earlyBirdLimit` (mặc định 0 = tắt), so với số đơn sách đã có. */
async function earlyBirdLeft(db: Firestore): Promise<boolean> {
  const setting = await db.collection("settings").doc("bookSale").get();
  const limit = toNumber(setting.data()?.earlyBirdLimit);
  if (limit <= 0) return false;
  const counted = await db.collection("purchases").where("kind", "==", "book").count().get();
  return counted.data().count < limit;
}

export function placeBookOrder(input: BookOrderInput): Promise<DataResult<BookOrderResult>> {
  return runQuery("purchases:book", async (db) => {
    let isStudent = false;
    if (input.promoCode) {
      const code = normalizeCode(input.promoCode);
      if (code) isStudent = (await db.collection("students").doc(code).get()).exists;
    }
    const discount = chooseBookDiscount(isStudent, isStudent ? false : await earlyBirdLeft(db));
    const unitPrice = bookUnitPrice(discount);
    const total = bookTotal(discount, input.quantity);

    const id = purchaseId("book", [input.phone, input.address, String(input.quantity), input.promoCode], 10 * 60_000);
    const outcome = await createOnce(db, id, {
      kind: "book",
      name: input.name,
      phone: input.phone,
      address: input.address,
      item: BOOK.title,
      quantity: input.quantity,
      promoCode: input.promoCode,
      // Chỉ ghi nhận ưu đãi học viên khi mã đúng; mã nhập sai không được lưu như đã xác minh.
      discount,
      unitPrice,
      total,
      status: "new",
    });
    return { discount, unitPrice, total, duplicate: outcome === "duplicate" };
  });
}

export interface CourseRegistrationInput {
  /** Mã học viên đang đăng nhập (đăng ký khóa luôn gắn với tài khoản). */
  studentId: string;
  name: string;
  phone: string;
  email: string;
  zalo: string;
  courseId: string;
  courseName: string;
  packageId: string;
  packageName: string;
  amount: number;
}

export interface CourseRegistrationResult {
  duplicate: boolean;
  payment: PaymentSettings | null;
}

export function readPaymentSettings(data: Record<string, unknown> | undefined): PaymentSettings | null {
  if (!data) return null;
  const bin = toText(data.bin);
  const account = toText(data.account);
  if (!bin || !account) return null;
  return {
    bankName: toText(data.bankName),
    bin,
    account,
    holder: toText(data.holder),
    prefix: toText(data.prefix) || "HOCTHUPHAP",
  };
}

export function placeCourseRegistration(input: CourseRegistrationInput): Promise<DataResult<CourseRegistrationResult>> {
  return runQuery("purchases:course", async (db) => {
    // Cùng số điện thoại + khóa + gói chỉ ghi nhận một lần.
    const id = purchaseId("course", [input.phone, input.courseId, input.packageId]);
    const outcome = await createOnce(db, id, {
      kind: "course",
      studentId: input.studentId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      zalo: input.zalo,
      courseId: input.courseId,
      packageId: input.packageId,
      item: `${input.courseName} · ${input.packageName}`,
      quantity: 1,
      unitPrice: input.amount,
      total: input.amount,
      status: "new",
    });
    let payment: PaymentSettings | null = null;
    if (input.amount > 0) payment = readPaymentSettings((await db.collection("settings").doc("payment").get()).data());
    return { duplicate: outcome === "duplicate", payment };
  });
}

export interface SealOrderInput {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
  /** Đã qua `validateSealItems` (giá do server tính). */
  items: SealItem[];
  total: number;
}

export interface SealOrderResult {
  duplicate: boolean;
}

export function placeSealOrder(input: SealOrderInput): Promise<DataResult<SealOrderResult>> {
  return runQuery("purchases:seal", async (db) => {
    const id = purchaseId("seal", [input.phone, input.address, JSON.stringify(input.items)], 10 * 60_000);
    const outcome = await createOnce(db, id, {
      kind: "seal",
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      item: sealSummary(input.items),
      items: input.items,
      quantity: input.items.reduce((sum, it) => sum + it.quantity, 0),
      note: input.note,
      total: input.total,
      status: "new",
    });
    return { duplicate: outcome === "duplicate" };
  });
}
