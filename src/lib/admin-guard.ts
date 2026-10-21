import "server-only";

import { isAdminAuthConfigured, isAdminSession } from "@/lib/admin-auth";

/**
 * Quyền GHI dữ liệu của thầy (cộng/trừ ngọc, chợ, chấm bài, tin tức).
 * Chặt hơn quyền XEM: `pocAdminOpen=true` chỉ cho xem, KHÔNG cho ghi. Ghi chỉ khi
 *  - chạy `next dev` (máy của thầy), hoặc
 *  - đã đăng nhập bằng khóa `adminAccessKey` (cookie ký HMAC).
 * Mọi Server Action của thầy PHẢI gọi hàm này đầu tiên (client có thể gọi Server Action trực tiếp, không chỉ qua nút).
 * POC-REWIND (3): thay bằng kiểm tra `role=admin` của tài khoản.
 */
export async function canAdminWrite(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  return isAdminAuthConfigured() && (await isAdminSession());
}
