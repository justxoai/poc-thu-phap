import "server-only";

import { findGem } from "@/data/gems";
import { getDb } from "@/lib/firebase/admin";
import { walletKeyFor } from "@/lib/ledger-view";
import { purchaseId } from "@/lib/firestore/purchases";
import { changeBalance } from "@/lib/wallet";
import type { TransactionSource } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Các thao tác GHI của khu thầy. CHỈ được gọi từ Server Action đã qua `canAdminWrite()` (lib/admin-guard.ts).
 * Lỗi nghiệp vụ ném `AdminOpError` (thông báo tiếng Việt, hiển thị được); lỗi khác để Server Action trả thông báo chung.
 */
export class AdminOpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminOpError";
  }
}

/* ---------- Ngọc ---------- */

export interface AdjustInput {
  studentId: string;
  gemKey: string;
  /** Khác 0. */
  amount: number;
  source: Extract<TransactionSource, "teacher_gift" | "admin_adjust">;
  note: string;
}

export async function adjustWallet(input: AdjustInput): Promise<{ name: string; label: string; balanceAfter: number; duplicate: boolean }> {
  const gem = findGem(input.gemKey);
  if (!gem) throw new AdminOpError("Loại ngọc không hợp lệ.");
  const snap = await getDb().collection("students").doc(input.studentId).get();
  if (!snap.exists) throw new AdminOpError("Không tìm thấy học viên với mã này.");
  const data = snap.data() ?? {};
  const wallet: Record<string, number> = {};
  if (data.wallet && typeof data.wallet === "object") for (const [k, v] of Object.entries(data.wallet as Record<string, unknown>)) if (typeof v === "number") wallet[k] = v;
  const currency = walletKeyFor(wallet, gem.key);
  try {
    const result = await changeBalance({
      studentId: input.studentId,
      currency,
      amount: input.amount,
      source: input.source,
      note: input.note || undefined,
      // Bấm gửi hai lần trong 2 phút với cùng nội dung chỉ ghi một lần.
      idempotencyKey: purchaseId("adjust", [input.studentId, currency, String(input.amount), input.source, input.note], 120_000),
    });
    return { name: typeof data.name === "string" ? data.name : input.studentId, label: gem.name, balanceAfter: result.balanceAfter, duplicate: result.duplicate };
  } catch (error) {
    if (error instanceof Error && error.name === "InsufficientBalanceError") throw new AdminOpError(`Số dư ${gem.name} không đủ để trừ ${-input.amount}.`);
    throw error;
  }
}

/* ---------- Chợ phiên ---------- */

export interface MarketItemInput {
  /** Có = sửa, không = thêm mới. */
  id: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  rarity: string;
  /** Số lượng còn; null = không giới hạn. */
  stock: number | null;
  /** Đường dẫn ảnh trong public/images/vat-pham, "" = không ảnh. */
  image: string;
  merchantId: string;
  promo: boolean;
  /** % giảm 1–99 khi `promo`; 0 khi không. */
  promoPercent: number;
  active: boolean;
}

export async function saveMarketItem(input: MarketItemInput): Promise<{ id: string; created: boolean }> {
  const col = getDb().collection("market");
  const fields = {
    name: input.name,
    description: input.description,
    price: input.price,
    currency: input.currency,
    rarity: input.rarity,
    image: input.image,
    merchantId: input.merchantId,
    promo: input.promo,
    promoPercent: input.promo ? input.promoPercent : 0,
    active: input.active,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.id) {
    const ref = col.doc(input.id);
    if (!(await ref.get()).exists) throw new AdminOpError("Không tìm thấy vật phẩm để sửa.");
    // Trống = không giới hạn: xóa trường `stock` (khác với 0 là hết hàng).
    await ref.update({ ...fields, stock: input.stock === null ? FieldValue.delete() : input.stock });
    return { id: input.id, created: false };
  }
  const ref = col.doc();
  await ref.set({ ...fields, ...(input.stock === null ? {} : { stock: input.stock }), createdAt: FieldValue.serverTimestamp() });
  return { id: ref.id, created: true };
}

/** Nhập thêm hàng. Vật phẩm không giới hạn (không có số `stock`) không nhập kho được, để không vô tình biến thành có giới hạn. */
export async function restockMarketItem(id: string, delta: number): Promise<number> {
  const db = getDb();
  const ref = db.collection("market").doc(id);
  return db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new AdminOpError("Không tìm thấy vật phẩm.");
    const stock = snap.data()?.stock;
    if (typeof stock !== "number" || !Number.isFinite(stock)) throw new AdminOpError("Vật phẩm này không giới hạn số lượng.");
    const next = Math.max(0, Math.floor(stock) + delta);
    t.update(ref, { stock: next, updatedAt: FieldValue.serverTimestamp() });
    return next;
  });
}

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "done"] as const;

/** Chỉ đổi trạng thái. Hủy đơn/hoàn ngọc CHƯA làm (cần chốt quy tắc hoàn kho và hoàn ngọc). */
export async function setOrderStatus(id: string, status: (typeof ORDER_STATUSES)[number]): Promise<void> {
  const ref = getDb().collection("orders").doc(id);
  if (!(await ref.get()).exists) throw new AdminOpError("Không tìm thấy đơn.");
  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
}

/* ---------- Chấm bài ---------- */

/** Ghi điểm và cập nhật thống kê học viên trong cùng một transaction; chấm lại thì chỉ cộng phần chênh. */
export async function gradeWork(workId: string, score: number, comment: string): Promise<{ studentName: string; average: number; regrade: boolean }> {
  const db = getDb();
  const workRef = db.collection("homework").doc(workId);
  return db.runTransaction(async (t) => {
    const work = await t.get(workRef);
    if (!work.exists) throw new AdminOpError("Không tìm thấy bài.");
    const data = work.data() ?? {};
    const studentId = typeof data.studentId === "string" ? data.studentId : "";
    if (!studentId) throw new AdminOpError("Bài này không gắn với học viên nào.");
    const studentRef = db.collection("students").doc(studentId);
    const student = await t.get(studentRef);
    if (!student.exists) throw new AdminOpError("Không tìm thấy học viên của bài này.");

    const previous = typeof data.score === "number" && Number.isFinite(data.score) ? data.score : null;
    const stats = (student.data()?.stats ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
    const gradedCount = num(stats.gradedCount) + (previous === null ? 1 : 0);
    const scoreSum = Math.round((num(stats.scoreSum) + score - (previous ?? 0)) * 100) / 100;

    t.update(workRef, { score, comment, graded: true, gradedAt: FieldValue.serverTimestamp() });
    t.update(studentRef, { "stats.gradedCount": gradedCount, "stats.scoreSum": scoreSum, updatedAt: FieldValue.serverTimestamp() });
    return { studentName: typeof student.data()?.name === "string" ? (student.data()?.name as string) : studentId, average: Math.round((scoreSum / gradedCount) * 100) / 100, regrade: previous !== null };
  });
}

/* ---------- Tin tức ---------- */

export interface PostWrite {
  id: string;
  /** true = bài mới (từ chối nếu địa chỉ đã có). */
  isNew: boolean;
  title: string;
  summary: string;
  thumbnail: string;
  labels: string[];
  publishedAt: Date;
  /** Đã qua `sanitizePostHtml`. */
  html: string;
  status: "published" | "draft";
}

export async function savePost(post: PostWrite): Promise<void> {
  const ref = getDb().collection("posts").doc(post.id);
  const fields = {
    title: post.title,
    summary: post.summary,
    thumbnail: post.thumbnail,
    labels: post.labels,
    publishedAt: post.publishedAt,
    html: post.html,
    status: post.status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (post.isNew) {
    try {
      await ref.create({ ...fields, createdAt: FieldValue.serverTimestamp() });
    } catch (error) {
      const e = error as { code?: unknown; message?: unknown } | null;
      if (e?.code === 6 || (typeof e?.message === "string" && e.message.includes("ALREADY_EXISTS"))) throw new AdminOpError("Đã có bài khác trùng địa chỉ (tháng và đường dẫn). Hãy đổi đường dẫn.");
      throw error;
    }
    return;
  }
  if (!(await ref.get()).exists) throw new AdminOpError("Không tìm thấy bài để sửa.");
  await ref.update(fields);
}

/* ---------- Danh mục bán (sách, ấn, khóa học, tài liệu) ---------- */

export interface CatalogInput {
  id: string | null;
  kind: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export async function saveCatalogItem(input: CatalogInput): Promise<{ id: string; created: boolean }> {
  const col = getDb().collection("catalog");
  const fields = { kind: input.kind, name: input.name, description: input.description, price: input.price, active: input.active, updatedAt: FieldValue.serverTimestamp() };
  if (input.id) {
    const ref = col.doc(input.id);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminOpError("Không tìm thấy mục để sửa.");
    // Không cho đổi loại của một mục đã có (tránh nhảy sang tab khác).
    await ref.update({ name: fields.name, description: fields.description, price: fields.price, active: fields.active, updatedAt: fields.updatedAt });
    return { id: input.id, created: false };
  }
  const ref = col.doc();
  await ref.set({ ...fields, createdAt: FieldValue.serverTimestamp() });
  return { id: ref.id, created: true };
}

/** Nạp các mục có sẵn: chỉ tạo mục CHƯA có (mã cố định), không ghi đè mục thầy đã sửa. Trả số mục mới. */
export async function seedCatalogItems(items: { id: string; kind: string; name: string; description: string; price: number }[]): Promise<number> {
  if (items.length === 0) return 0;
  const db = getDb();
  return db.runTransaction(async (t) => {
    const refs = items.map((i) => db.collection("catalog").doc(i.id));
    const snaps = await Promise.all(refs.map((r) => t.get(r)));
    let added = 0;
    snaps.forEach((snap, idx) => {
      if (snap.exists) return;
      const i = items[idx];
      t.set(refs[idx], { kind: i.kind, name: i.name, description: i.description, price: i.price, active: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      added += 1;
    });
    return added;
  });
}
