"use server";

import { validateAccountInput, type AccountErrors, type AccountField } from "@/lib/account-validation";
import { createStudentAccount } from "@/lib/firestore/accounts";
import { hashPassword } from "@/lib/password";
import { startStudentSession } from "@/lib/session";
import { cleanLine } from "@/lib/validation";

export type RegisterAccountState =
  | { status: "idle" }
  | { status: "error"; message?: string; fields: AccountErrors }
  | { status: "ok"; code: string; name: string; loggedIn: boolean };

const FIELDS: AccountField[] = ["name", "phone", "email", "birthDate", "address", "zaloName", "password", "confirmPassword"];

/**
 * Tạo tài khoản học viên. Kiểm tra lại toàn bộ ở server (trình duyệt chỉ để báo lỗi sớm). Mật khẩu chỉ đi qua đây một lần
 * để băm (scrypt), không ghi log, không trả lại trình duyệt. Tạo xong tự đăng nhập. Chưa có CAPTCHA/rate limit (POC-REWIND 4);
 * có ô bẫy `website`. Tài khoản mới chưa có Tổ/Khóa, rank 0, ví trống; email chưa được xác minh.
 */
export async function registerAccountAction(_prev: RegisterAccountState, formData: FormData): Promise<RegisterAccountState> {
  if (cleanLine(formData.get("website"), 50) !== "") return { status: "error", fields: {}, message: "Không gửi được. Vui lòng thử lại." };

  const raw: Record<string, unknown> = {};
  for (const field of FIELDS) raw[field] = formData.get(field);
  const check = validateAccountInput(raw);
  if (!check.ok) return { status: "error", fields: check.errors };

  const { password, ...values } = check.values;
  const created = await createStudentAccount(values, await hashPassword(password));
  if (created.status === "taken") {
    return {
      status: "error",
      fields: created.field === "phone" ? { phone: "Số điện thoại này đã có tài khoản. Hãy đăng nhập hoặc dùng số khác." } : { email: "Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác." },
    };
  }
  if (created.status === "unconfigured") return { status: "error", fields: {}, message: "Hệ thống chưa kết nối dữ liệu. Vui lòng thử lại sau." };
  if (created.status === "error") return { status: "error", fields: {}, message: "Chưa tạo được tài khoản. Vui lòng thử lại sau." };

  const loggedIn = await startStudentSession(created.code);
  return { status: "ok", code: created.code, name: values.name, loggedIn };
}
