import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { getDb } from "@/lib/firebase/admin";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import { hashPassword, verifyPassword } from "@/lib/password";
import { QUICK_LOCK_MINUTES, QUICK_MAX_FAILS } from "@/lib/quick-code";
import type { DataResult } from "@/lib/types";

/**
 * Mã nhanh (6 số, học viên tự đặt) = yếu tố đăng nhập thứ hai đi cùng mã học viên.
 * Lưu ở `students/{id}`:
 * - `quickCodeHash`: băm scrypt của mã ("" = chưa đặt). KHÔNG lưu mã thô nên không ai (kể cả thầy, kể cả xem Firestore Console) đọc lại được.
 * - `quickFail`: `{ count, lockedUntil }` (ms). Chặn dò mã: mỗi lần thử được tính TRƯỚC khi so mã (trong transaction) nên nhiều
 *   yêu cầu song song cũng không vượt quá QUICK_MAX_FAILS lần; sai đủ số lần thì khóa QUICK_LOCK_MINUTES phút (mật khẩu vẫn dùng được).
 * Không có chỉ mục theo mã: mã nhanh không cần duy nhất toàn hệ thống (luôn đi kèm mã học viên), nên cũng không lộ "mã nào đang được dùng".
 * Tài khoản role admin KHÔNG dùng mã nhanh (6 số quá yếu cho quyền quản trị).
 */

export type SetQuickCodeResult = "ok" | "missing" | "admin";

/** Đặt (code) hoặc xóa (null) mã nhanh của CHÍNH học viên. Đặt mới thì xóa luôn bộ đếm sai/khóa. */
export async function setQuickCode(studentId: string, code: string | null): Promise<SetQuickCodeResult> {
  const db = getDb();
  const ref = db.collection("students").doc(studentId);
  const snap = await ref.get();
  if (!snap.exists) return "missing";
  if (snap.data()?.role === "admin") return "admin";
  const hash = code ? await hashPassword(code) : "";
  await ref.update({ quickCodeHash: hash, quickFail: { count: 0, lockedUntil: null }, updatedAt: FieldValue.serverTimestamp() });
  return "ok";
}

/** Học viên này có dùng được đăng nhập bằng mã nhanh không (đã đặt mã và không phải admin). Không trả mã hay băm. */
export function quickLoginAvailable(studentId: string): Promise<DataResult<boolean>> {
  return runQuery("quickcode:available", async (db) => {
    const snap = await db.collection("students").doc(studentId).get();
    const d = snap.data();
    return snap.exists && !!d && d.role !== "admin" && toText(d.quickCodeHash) !== "";
  });
}

export type QuickLoginResult =
  | { status: "ok" }
  | { status: "unavailable" }
  | { status: "wrong"; remaining: number }
  | { status: "locked"; minutes: number };

/** Kiểm tra mã nhanh của một học viên. Gọi hàm này KHÔNG mở phiên; việc mở phiên do nơi gọi làm khi `ok`. */
export async function verifyQuickLogin(studentId: string, quick: string, now: number = Date.now()): Promise<QuickLoginResult> {
  const db = getDb();
  const ref = db.collection("students").doc(studentId);

  // Bước 1 (transaction): xin một lượt thử. Đã khóa thì dừng; chưa thì cộng lượt thử NGAY, trước khi so mã.
  const slot = await db.runTransaction<{ status: "go"; hash: string; remaining: number } | Exclude<QuickLoginResult, { status: "ok" } | { status: "wrong" }>>(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data();
    if (!snap.exists || !d || d.role === "admin") return { status: "unavailable" };
    const hash = toText(d.quickCodeHash);
    if (hash === "") return { status: "unavailable" };
    const fail = (d.quickFail && typeof d.quickFail === "object" ? d.quickFail : {}) as Record<string, unknown>;
    const lockedUntil = toNumber(fail.lockedUntil);
    if (lockedUntil > now) return { status: "locked", minutes: Math.max(1, Math.ceil((lockedUntil - now) / 60000)) };
    const used = toNumber(fail.count) + 1;
    if (used >= QUICK_MAX_FAILS) tx.update(ref, { quickFail: { count: 0, lockedUntil: now + QUICK_LOCK_MINUTES * 60000 } });
    else tx.update(ref, { quickFail: { count: used, lockedUntil: null } });
    return { status: "go", hash, remaining: QUICK_MAX_FAILS - used };
  });
  if (slot.status !== "go") return slot;

  // Bước 2: so mã (timing-safe, scrypt). Đúng thì xóa bộ đếm; sai thì giữ nguyên lượt đã tính.
  if (await verifyPassword(quick, slot.hash)) {
    await ref.update({ quickFail: { count: 0, lockedUntil: null } });
    return { status: "ok" };
  }
  return slot.remaining <= 0 ? { status: "locked", minutes: QUICK_LOCK_MINUTES } : { status: "wrong", remaining: slot.remaining };
}
