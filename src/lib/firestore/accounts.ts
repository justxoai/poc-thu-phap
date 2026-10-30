import "server-only";

import { createHash } from "node:crypto";

import { FieldPath, FieldValue } from "firebase-admin/firestore";

import { DEFAULT_DECOR, type Decor } from "@/data/decor";
import type { AccountValues } from "@/lib/account-validation";
import { getDb, isAdminConfigured } from "@/lib/firebase/admin";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { fetchPage } from "@/lib/firestore/admin-page";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { PageInfo, PageRequest } from "@/lib/admin-paging";
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

/** Một trang tài khoản mới chờ xếp Tổ/Khóa, mới nhất trước. Cần index kết hợp: placement + createdAt DESC (firestore.indexes.json). */
export function listPendingPage(req: PageRequest): Promise<DataResult<{ rows: PendingStudent[]; info: PageInfo }>> {
  return runQuery("accounts:pending-page", async (db) => {
    const where = db.collection("students").where("placement", "==", "pending");
    const { docs, info } = await fetchPage({
      base: where.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc"),
      countQuery: where,
      req,
      toValues: (cursor) => {
        const c = isCursor(cursor) ? decodeCursor(cursor) : null;
        return c ? [c.at, c.id] : null;
      },
      cursorOf: (doc) => encodeCursor(toIso(doc.data().createdAt), doc.id),
    });
    return { rows: docs.map((d) => ({ id: d.id, name: toText(d.data().name), createdAt: toIso(d.data().createdAt) })), info };
  });
}

/** Thông tin liên hệ + trạng thái tài khoản của MỘT học viên, chỉ để thầy xem ở popup chi tiết (sau `getAdminViewer()`). Không trả `passwordHash`. */
export interface AdminContact {
  phone: string;
  email: string;
  emailVerified: boolean;
  birthDate: string;
  address: string;
  zaloName: string;
  role: "student" | "admin";
  placement: string;
  paid: boolean;
  createdAt: string | null;
}

export function getAdminContact(studentId: string): Promise<DataResult<AdminContact | null>> {
  return runQuery("accounts:admin-contact", async (db) => {
    const snap = await db.collection("students").doc(studentId).get();
    const d = snap.data();
    if (!snap.exists || !d) return null;
    return {
      phone: toText(d.phone),
      email: toText(d.email),
      emailVerified: d.emailVerified === true,
      birthDate: toText(d.birthDate),
      address: toText(d.address),
      zaloName: toText(d.zaloName),
      role: d.role === "admin" ? "admin" : "student",
      placement: toText(d.placement),
      paid: d.paid === true,
      createdAt: toIso(d.createdAt),
    };
  });
}

/**
 * Xóa MỀM học viên: chép nguyên hồ sơ sang `studentsArchive/{mã}` (kèm `deletedAt`, `deletedBy`) rồi xóa khỏi `students` trong cùng một transaction.
 * Hệ quả: biến mất khỏi mọi danh sách và không đăng nhập được; bài nộp, sổ cái, đơn hàng giữ nguyên (khôi phục = chép ngược lại).
 * Chỉ mục SĐT/email (`accountIndex`) được giữ để không ai đăng ký trùng lại trong lúc chưa khôi phục.
 * Tài khoản quản trị không xóa được bằng hàm này.
 */
export async function archiveStudent(studentId: string, deletedBy: string): Promise<"ok" | "missing" | "protected"> {
  const db = getDb();
  return db.runTransaction<"ok" | "missing" | "protected">(async (tx) => {
    const ref = db.collection("students").doc(studentId);
    const snap = await tx.get(ref);
    const data = snap.data();
    if (!snap.exists || !data) return "missing";
    if (data.role === "admin") return "protected";
    tx.create(db.collection("studentsArchive").doc(studentId), { ...data, deletedAt: FieldValue.serverTimestamp(), deletedBy });
    tx.delete(ref);
    return "ok";
  });
}
