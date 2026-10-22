/**
 * Mã nhanh: dãy 6 chữ số do CHÍNH học viên đặt trong Dashboard (khác hẳn mã học viên TTxxxxx).
 * Dùng cùng mã học viên để đăng nhập nhanh qua Minh Hồng: nhập mã học viên -> nhập mã nhanh -> được tính là đăng nhập.
 * Thầy không xem/đặt/đổi mã này; tài khoản quản trị (role admin) không dùng mã nhanh, chỉ đăng nhập bằng mật khẩu.
 * File thuần (không import server-only) để dùng cả ở client lẫn server.
 */
export const QUICK_CODE_LENGTH = 6;

/** Sai quá số lần này thì khóa mã nhanh của tài khoản đó một thời gian (vẫn đăng nhập được bằng mật khẩu). */
export const QUICK_MAX_FAILS = 5;
export const QUICK_LOCK_MINUTES = 15;

const QUICK_CODE = new RegExp(`^\\d{${QUICK_CODE_LENGTH}}$`);

/** Nhận chuỗi người dùng nhập; bỏ khoảng trắng; trả null nếu không đúng 6 chữ số. */
export function parseQuickCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/\s+/g, "");
  return QUICK_CODE.test(code) ? code : null;
}

export const QUICK_CODE_HINT = `Mã nhanh gồm đúng ${QUICK_CODE_LENGTH} chữ số.`;
