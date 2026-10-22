import "server-only";

import { cookies } from "next/headers";

import type { Decor } from "@/data/decor";
import { getViewerRecord } from "@/lib/firestore/viewer";
import { normalizeCode } from "@/lib/firestore/students";
import { SESSION_MS, createStudentToken, verifyStudentToken } from "@/lib/session-token";

/**
 * Người đang xem trang (học viên đã đăng nhập bằng mật khẩu qua Minh Hồng).
 *
 * Phiên: cookie `student_session` = `<mã>.<hết hạn>.<HMAC>` (xem `lib/session-token.ts`), httpOnly, hạn 7 ngày, ký bằng biến `sessionSecret`.
 * Không có `sessionSecret` thì không tạo được phiên (trừ `next dev`).
 *
 * Quyền: `role` đọc từ `students/{id}.role` mỗi lần ("admin" chỉ khi đặt tay trong Firestore Console; mọi giá trị khác = "student").
 * Quản trị (`/admin/dashboard`) dùng `lib/admin-guard.ts`.
 *
 * ===== CÒN LẠI CỦA CHẾ ĐỘ POC (tìm "POC-REWIND" trong mã nguồn) =====
 *  (2) Học viên CŨ (nhập từ Google Sheets) chưa có `passwordHash` nên CHƯA đăng nhập được; cần cách cấp mật khẩu (thầy cấp tạm + mustChangePassword).
 *  (4) Chưa có rate limit/CAPTCHA cho việc dò mật khẩu/mã.
 * =====
 *
 * Quan trọng: KHÔNG gọi `getViewer()` trong layout gốc (cookies() sẽ biến mọi trang thành động, mất ISR/CDN).
 * Chỉ gọi trong trang cần phân quyền (đã `force-dynamic`) và trong `/api/session`.
 */
export interface Viewer {
  studentId: string;
  name: string;
  group: string;
  course: string;
  /** Điểm kinh nghiệm (= Rank) để mở khóa bài lâm mô. */
  xp: number;
  /** Trang trí hồ sơ (đã chuẩn hóa). */
  decor: Decor;
  /** Đã mở gói trả phí (video trả phí, tài liệu trả phí). */
  paid: boolean;
  role: "student" | "admin";
}

export const STUDENT_COOKIE = "student_session";

export async function getViewer(): Promise<Viewer | null> {
  const jar = await cookies();
  const code = normalizeCode(verifyStudentToken(jar.get(STUDENT_COOKIE)?.value) ?? undefined);
  if (!code) return null;
  const record = await getViewerRecord(code);
  return record.status === "ok" ? record.data : null;
}

/** Bắt đầu phiên cho học viên (gọi sau khi đã kiểm tra mật khẩu). Trả false nếu chưa cấu hình `sessionSecret`. */
export async function startStudentSession(studentId: string): Promise<boolean> {
  const token = createStudentToken(studentId);
  if (!token) return false;
  const jar = await cookies();
  jar.set(STUDENT_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MS / 1000 });
  return true;
}

export async function endStudentSession(): Promise<void> {
  (await cookies()).delete(STUDENT_COOKIE);
}
