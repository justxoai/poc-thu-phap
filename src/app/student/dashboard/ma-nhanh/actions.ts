"use server";

import { revalidatePath } from "next/cache";

import { isAdminConfigured } from "@/lib/firebase/admin";
import { setQuickCode } from "@/lib/firestore/quick-code";
import { logError } from "@/lib/log-error";
import { QUICK_CODE_HINT, parseQuickCode } from "@/lib/quick-code";
import { getViewer } from "@/lib/session";

export type QuickCodeState = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; message: string };

/**
 * Học viên đặt/đổi/xóa mã nhanh của CHÍNH mình (mã học viên lấy từ phiên, không từ biểu mẫu).
 * `intent=remove` xóa mã; còn lại lưu mã trong ô `code` (đúng 6 chữ số). Mã được băm trước khi lưu, không xem lại được.
 */
export async function saveQuickCodeAction(_prev: QuickCodeState, formData: FormData): Promise<QuickCodeState> {
  const viewer = await getViewer();
  if (!viewer) return { status: "error", message: "Bạn cần đăng nhập (nút Minh Hồng) trước." };
  if (!isAdminConfigured()) return { status: "error", message: "Hệ thống chưa kết nối dữ liệu. Vui lòng thử lại sau." };

  const remove = formData.get("intent") === "remove";
  const code = remove ? null : parseQuickCode(formData.get("code"));
  if (!remove && !code) return { status: "error", message: QUICK_CODE_HINT };

  try {
    const result = await setQuickCode(viewer.studentId, code);
    if (result === "admin") return { status: "error", message: "Tài khoản quản trị chỉ đăng nhập bằng mật khẩu, không dùng mã nhanh." };
    if (result === "missing") return { status: "error", message: "Không tìm thấy hồ sơ." };
  } catch (error) {
    logError("quickcode:set", error);
    return { status: "error", message: "Chưa lưu được. Vui lòng thử lại sau." };
  }
  revalidatePath("/student/dashboard", "layout");
  return { status: "ok", message: remove ? "Đã xóa mã nhanh." : "Đã lưu mã nhanh." };
}
