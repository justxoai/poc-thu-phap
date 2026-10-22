import "server-only";

import { createHash } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { DEFAULT_DECOR, type Decor } from "@/data/decor";
import type { AccountValues } from "@/lib/account-validation";
import { getDb, isAdminConfigured } from "@/lib/firebase/admin";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import { normalizeCode } from "@/lib/firestore/students";
import type { DataResult } from "@/lib/types";
import { parseVnPhone } from "@/lib/validation";
import { logError } from "@/lib/log-error";

/**
 * Tài khoản học viên (tự đăng ký).
 * - `students/{mã}`: hồ sơ + `passwordHash` (scrypt). `passwordHash`, SĐT, email, ngày sinh KHÔNG được đọc ở nơi nào khác ngoài file này.
 * - `accountIndex/{loại}_{băm}`: chỉ mục để (1) mỗi SĐT/email chỉ đăng ký một lần (tạo bằng `create()` trong cùng transaction),
 *   (2) đăng nhập bằng SĐT/email. ID là băm SHA-256 nên không lộ SĐT/email trong đường dẫn. Nội dung: `{ studentId, createdAt }`.
 * - `meta/studentSeq`: `{ next }` bộ đếm mã học viên. Mã = "TT" + số thứ tự 5 chữ số (TT00001...). Bỏ qua số đã có document.
 */
export const CODE_PREFIX = "TT";

export function formatStudentCode(n: number): string {
  return `${CODE_PREFIX}${String(n).padStart(5, "0")}`;
}

export function indexId(kind: "phone" | "email", value: string): string {
  return `${kind}_${createHash("sha256").update(`${kind}|${value}`).digest("hex").slice(0, 40)}`;
}

export type CreateAccountResult =
  | { status: "ok"; code: string }
  | { status: "taken"; field: "phone" | "email" }
  | { status: "unconfigured" }
  | { status: "error" };

const MAX_CODE_PROBES = 50;

export async function createStudentAccount(values: Omit<AccountValues, "password">, passwordHash: string): Promise<CreateAccountResult> {
  if (!isAdminConfigured()) return { status: "unconfigured" };
  try {
    const db = getDb();
    return await db.runTransaction<CreateAccountResult>(async (tx) => {
      const phoneRef = db.collection("accountIndex").doc(indexId("phone", values.phone));
      const emailRef = db.collection("accountIndex").doc(indexId("email", values.email));
      const seqRef = db.collection("meta").doc("studentSeq");
      const [phoneSnap, emailSnap, seqSnap] = await Promise.all([tx.get(phoneRef), tx.get(emailRef), tx.get(seqRef)]);
      if (phoneSnap.exists) return { status: "taken", field: "phone" };
      if (emailSnap.exists) return { status: "taken", field: "email" };

      let n = Math.max(1, Math.floor(toNumber(seqSnap.data()?.next, 1)));
      let code = "";
      for (let i = 0; i < MAX_CODE_PROBES; i += 1) {
        const candidate = formatStudentCode(n);
        const snap = await tx.get(db.collection("students").doc(candidate));
        if (!snap.exists) {
          code = candidate;
          break;
        }
        n += 1;
      }
      if (!code) throw new Error("no free code");

      tx.create(db.collection("students").doc(code), {
        name: values.name,
        phone: values.phone,
        email: values.email,
        emailVerified: false,
        birthDate: values.birthDate,
        address: values.address,
        zaloName: values.zaloName,
        passwordHash,
        mustChangePassword: false,
        role: "student",
        // Chưa xếp Tổ/Khóa: thầy xếp ở /admin/dashboard (tab "Học viên mới"). `placement: "pending"` để tìm nhanh, không cần index.
        group: "",
        course: "",
        placement: "pending",
        paid: false,
        wallet: {},
        inventory: {},
        stats: { submissionCount: 0, gradedCount: 0, scoreSum: 0, lastSubmittedAt: null },
        decor: DEFAULT_DECOR,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.create(phoneRef, { studentId: code, createdAt: FieldValue.serverTimestamp() });
      tx.create(emailRef, { studentId: code, createdAt: FieldValue.serverTimestamp() });
      tx.set(seqRef, { next: n + 1 }, { merge: true });
      return { status: "ok", code };
    });
  } catch (error) {
    logError("accounts:create", error);
    return { status: "error" };
  }
}

export interface LoginRecord {
  id: string;
  /** null = tài khoản cũ chưa có mật khẩu. */
  passwordHash: string | null;
  role: "student" | "admin";
}

/** Tìm tài khoản theo mã học viên, email hoặc số điện thoại. Chỉ trả những gì cần để kiểm tra mật khẩu. */
export function findLoginRecord(identifier: string): Promise<DataResult<LoginRecord | null>> {
  return runQuery("accounts:login", async (db) => {
    const text = identifier.trim();
    let id: string | null = null;
    if (text.includes("@")) {
      const snap = await db.collection("accountIndex").doc(indexId("email", text.toLowerCase())).get();
      id = snap.exists ? normalizeCode(snap.data()?.studentId) : null;
    } else {
      const phone = parseVnPhone(text);
      if (phone) {
        const snap = await db.collection("accountIndex").doc(indexId("phone", phone)).get();
        id = snap.exists ? normalizeCode(snap.data()?.studentId) : null;
      } else {
        const typed = normalizeCode(text);
        if (typed) {
          // Mã cũ phân biệt hoa/thường; thử đúng như nhập rồi mới thử chữ hoa (mã mới là chữ hoa).
          for (const candidate of new Set([typed, typed.toUpperCase()])) {
            if ((await db.collection("students").doc(candidate).get()).exists) {
              id = candidate;
              break;
            }
          }
        }
      }
    }
    if (!id) return null;
    const student = await db.collection("students").doc(id).get();
    const data = student.data();
    if (!student.exists || !data) return null;
    const hash = toText(data.passwordHash);
    return { id, passwordHash: hash === "" ? null : hash, role: data.role === "admin" ? "admin" : "student" };
  });
}

/** Học viên lưu trang trí của chính mình. */
export async function saveDecor(studentId: string, decor: Decor): Promise<"ok" | "missing"> {
  const ref = getDb().collection("students").doc(studentId);
  const snap = await ref.get();
  if (!snap.exists) return "missing";
  await ref.update({ decor, updatedAt: FieldValue.serverTimestamp() });
  return "ok";
}

export interface PendingStudent {
  id: string;
  name: string;
  createdAt: string | null;
}

/** Tài khoản mới chờ xếp Tổ/Khóa. Chỉ tên + mã + ngày đăng ký (không SĐT/email). Lọc bằng một trường nên không cần index riêng. */
export function listPendingStudents(): Promise<DataResult<PendingStudent[]>> {
  return runQuery("accounts:pending", async (db) => {
    const snap = await db.collection("students").where("placement", "==", "pending").limit(100).get();
    const rows = snap.docs.map((doc) => {
      const d = doc.data();
      const created = d.createdAt as { toDate?: () => Date } | undefined;
      return { id: doc.id, name: toText(d.name), createdAt: created?.toDate ? created.toDate().toISOString() : null };
    });
    return rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  });
}

/** Thầy xếp Tổ/Khóa cho học viên (chỉ dùng sau `canAdminWrite()`). */
export async function placeStudent(studentId: string, group: string, course: string): Promise<"ok" | "missing"> {
  const ref = getDb().collection("students").doc(studentId);
  const snap = await ref.get();
  if (!snap.exists) return "missing";
  await ref.update({ group, course, placement: "done", updatedAt: FieldValue.serverTimestamp() });
  return "ok";
}

export interface OwnContact {
  name: string;
  phone: string;
  email: string;
  zalo: string;
}

/**
 * Thông tin liên hệ của CHÍNH học viên đang đăng nhập (dùng ở server để gắn vào đơn đăng ký khóa; không trả nguyên văn cho trình duyệt).
 * Tài khoản cũ nhập từ Sheets có thể thiếu SĐT/email: trả chuỗi rỗng.
 */
export function getOwnContact(studentId: string): Promise<DataResult<OwnContact | null>> {
  return runQuery("accounts:contact", async (db) => {
    const snap = await db.collection("students").doc(studentId).get();
    const d = snap.data();
    if (!snap.exists || !d) return null;
    return { name: toText(d.name), phone: toText(d.phone), email: toText(d.email), zalo: toText(d.zaloName) };
  });
}
