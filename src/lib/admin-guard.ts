import "server-only";

import { getViewer, type Viewer } from "@/lib/session";

/**
 * Quyền quản trị = tài khoản đang đăng nhập có `students/{id}.role === "admin"` (đọc lại từ Firestore mỗi lần).
 * Mọi người đăng ký đều là "student"; chỉ tài khoản của thầy được đặt role "admin" thủ công trong Firestore Console.
 * Mọi trang và Server Action của thầy PHẢI gọi hàm này đầu tiên (client có thể gọi Server Action trực tiếp, không chỉ qua nút).
 */
export async function getAdminViewer(): Promise<Viewer | null> {
  const viewer = await getViewer();
  return viewer && viewer.role === "admin" ? viewer : null;
}

export async function canAdminWrite(): Promise<boolean> {
  return (await getAdminViewer()) !== null;
}
