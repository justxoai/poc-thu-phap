import "server-only";

import { cookies } from "next/headers";

import { getViewerRecord } from "@/lib/firestore/viewer";
import { normalizeCode } from "@/lib/firestore/students";

/**
 * Người đang xem trang (học viên đã "đăng nhập" qua Minh Hồng).
 *
 * ===== CHẾ ĐỘ POC — ĐỌC KỸ KHI MUỐN LÀM THẬT (tìm chuỗi "POC-REWIND" trong mã nguồn để thấy mọi chỗ) =====
 * Hiện tại "đăng nhập" chỉ cần mã học viên hợp lệ, KHÔNG có mật khẩu và KHÔNG có hạn 7 ngày. Cụ thể:
 *  (1) Cookie `student_session` chứa thẳng mã học viên, KHÔNG ký, là cookie phiên (đóng trình duyệt là mất).
 *      => ai biết mã học viên của người khác thì vào được như người đó (giống trang tra cứu cũ).
 *      Làm thật: giá trị cookie = `<hết hạn>.<HMAC-SHA256>` như `lib/admin-auth.ts`, hạn 7 ngày (maxAge), kiểm tra lại mỗi lần đọc.
 *  (2) Không kiểm tra mật khẩu (`loginAction` ở `app/minh-hong/actions.ts`).
 *      Làm thật: `students/{id}.passwordHash` (scrypt + salt), `mustChangePassword` cho lần đầu, trang đổi mật khẩu.
 *  (3) Quản trị vẫn là `/dashboard` + `adminAccessKey` (chưa có role=admin). Nút "Quản trị" ở Minh Hồng hiện cho mọi người.
 *      Làm thật: `students/{id}.role = "admin"`, `getViewer()` trả role, chỉ hiện nút cho admin, `/dashboard` → `/admin/dashboard`.
 *  (4) Chưa có rate limit/CAPTCHA cho việc dò mã.
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
  /** Đã mở gói trả phí (video trả phí, tài liệu trả phí). */
  paid: boolean;
  role: "student" | "admin";
}

export const STUDENT_COOKIE = "student_session";

export async function getViewer(): Promise<Viewer | null> {
  const jar = await cookies();
  // POC-REWIND (1): ở đây phải verify chữ ký + hạn dùng trước khi tin giá trị cookie.
  const code = normalizeCode(jar.get(STUDENT_COOKIE)?.value);
  if (!code) return null;
  const record = await getViewerRecord(code);
  return record.status === "ok" ? record.data : null;
}

/** Bắt đầu phiên cho học viên (gọi sau khi đã kiểm tra mã). */
export async function startStudentSession(studentId: string): Promise<void> {
  const jar = await cookies();
  // POC-REWIND (1): thêm `maxAge: 7 * 24 * 3600` và giá trị đã ký. Hiện là cookie phiên, không ký.
  jar.set(STUDENT_COOKIE, studentId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

export async function endStudentSession(): Promise<void> {
  (await cookies()).delete(STUDENT_COOKIE);
}
