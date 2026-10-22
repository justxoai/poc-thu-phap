"use server";

import { levelFor } from "@/data/gems";
import { PASSWORD_MAX } from "@/lib/account-validation";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { findLoginRecord } from "@/lib/firestore/accounts";
import { burnPasswordCheck, verifyPassword } from "@/lib/password";
import { quickLoginAvailable, verifyQuickLogin } from "@/lib/firestore/quick-code";
import { getStudentProfile, normalizeCode } from "@/lib/firestore/students";
import { logError } from "@/lib/log-error";
import { QUICK_CODE_HINT, parseQuickCode } from "@/lib/quick-code";
import { endStudentSession, startStudentSession } from "@/lib/session";
import type { StudentPublicProfile } from "@/lib/types";

/** Thông tin hiển thị cho chính học viên trong khung Minh Hồng. Không có SĐT/email/địa chỉ. */
export interface MemberCard {
  name: string;
  group: string;
  course: string;
  rank: number;
  level: string;
  /** Chỉ để khung Minh Hồng biết có hiện lối vào Dashboard của thầy hay không (quyền thật được kiểm tra lại ở server). */
  role?: "student" | "admin";
}

/** Bước 1 của "Tôi đã có mã học viên": thẻ công khai + cho biết có đăng nhập bằng mã nhanh được không. `code` là mã học viên đã kiểm tra. */
export type CodeCheckState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; card: MemberCard; code: string; quickLogin: boolean };
export type LoginState = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; card: MemberCard };

const MSG_UNAVAILABLE = "Hệ thống chưa kết nối dữ liệu. Vui lòng thử lại sau.";

function toCard(profile: StudentPublicProfile, role?: "student" | "admin"): MemberCard {
  const rank = profile.stats.submissionCount + profile.stats.scoreSum;
  return { name: profile.name, group: profile.group, course: profile.course, rank, level: levelFor(rank), ...(role ? { role } : {}) };
}

// POC-REWIND (4): bước tra mã học viên chưa có rate limit/CAPTCHA (kết quả chỉ là thông tin công khai). Mã nhanh thì đã có khóa tạm theo tài khoản.
async function findStudent(formData: FormData): Promise<{ error: string } | { code: string; profile: StudentPublicProfile }> {
  const raw = formData.get("code");
  if (typeof raw !== "string" || raw.trim() === "") return { error: "Vui lòng nhập mã học viên." };
  const code = normalizeCode(raw);
  if (!code) return { error: "Mã học viên không hợp lệ." };
  const found = await getStudentProfile(code);
  if (found.status === "unconfigured") return { error: MSG_UNAVAILABLE };
  if (found.status === "error") return { error: "Chưa kiểm tra được. Vui lòng thử lại sau." };
  if (!found.data) return { error: "Không tìm thấy học viên với mã này." };
  return { code, profile: found.data };
}

/**
 * "Tôi đã có mã học viên", bước 1: kiểm tra mã học viên, cho xem thông tin đơn giản (công khai) và cho biết
 * học viên đã đặt mã nhanh chưa. KHÔNG mở phiên đăng nhập; việc đó là của `quickLoginAction`.
 */
export async function checkCodeAction(_prev: CodeCheckState, formData: FormData): Promise<CodeCheckState> {
  const found = await findStudent(formData);
  if ("error" in found) return { status: "error", message: found.error };
  const quick = await quickLoginAvailable(found.code);
  return { status: "ok", card: toCard(found.profile), code: found.code, quickLogin: quick.status === "ok" && quick.data };
}

/**
 * Bước 2: nhập mã nhanh (6 số) đi cùng mã học viên ở bước 1. Đúng thì được tính là đăng nhập (cùng loại phiên với đăng nhập bằng mật khẩu).
 * Chặn dò mã: sai QUICK_MAX_FAILS lần thì khóa QUICK_LOCK_MINUTES phút theo tài khoản (xem lib/firestore/quick-code.ts). Tài khoản admin không dùng được.
 */
export async function quickLoginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const code = normalizeCode(formData.get("code"));
  if (!code) return { status: "error", message: "Mã học viên không hợp lệ. Hãy kiểm tra lại mã ở bước trước." };
  const quick = parseQuickCode(formData.get("quick"));
  if (!quick) return { status: "error", message: QUICK_CODE_HINT };
  if (!isAdminConfigured()) return { status: "error", message: MSG_UNAVAILABLE };

  let result;
  try {
    result = await verifyQuickLogin(code, quick);
  } catch (error) {
    logError("quicklogin", error);
    return { status: "error", message: "Chưa kiểm tra được. Vui lòng thử lại sau." };
  }
  if (result.status === "unavailable") return { status: "error", message: "Tài khoản này chưa đặt mã nhanh. Hãy đăng nhập bằng mật khẩu, rồi vào Dashboard, mục “Mã nhanh” để đặt." };
  if (result.status === "locked") return { status: "error", message: `Bạn đã nhập sai quá nhiều lần. Hãy thử lại sau ${result.minutes} phút hoặc đăng nhập bằng mật khẩu.` };
  if (result.status === "wrong") return { status: "error", message: `Mã nhanh chưa đúng. Còn ${result.remaining} lần thử.` };

  const profile = await getStudentProfile(code);
  if (profile.status !== "ok" || !profile.data) return { status: "error", message: "Chưa kiểm tra được. Vui lòng thử lại sau." };
  if (!(await startStudentSession(code))) return { status: "error", message: "Hệ thống chưa cấu hình phiên đăng nhập (thiếu sessionSecret)." };
  return { status: "ok", card: toCard(profile.data, "student") };
}

const MSG_BAD_LOGIN = "Tài khoản hoặc mật khẩu chưa đúng.";

/**
 * "Đăng nhập tài khoản": nhập MÃ HỌC VIÊN, EMAIL hoặc SỐ ĐIỆN THOẠI + mật khẩu. Sai bất kỳ thứ gì đều báo cùng một câu
 * (không cho biết tài khoản có tồn tại) và tốn thời gian như nhau. Mật khẩu so bằng scrypt (timing-safe), không ghi log.
 * Chưa có rate limit/CAPTCHA (POC-REWIND 4).
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = typeof formData.get("identifier") === "string" ? (formData.get("identifier") as string).trim().slice(0, 120) : "";
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string).slice(0, PASSWORD_MAX) : "";
  if (identifier === "") return { status: "error", message: "Vui lòng nhập mã học viên, email hoặc số điện thoại." };

  const found = await findLoginRecord(identifier);
  if (found.status === "unconfigured") return { status: "error", message: MSG_UNAVAILABLE };
  if (found.status === "error") return { status: "error", message: "Chưa kiểm tra được. Vui lòng thử lại sau." };

  const record = found.data;
  let allowed = false;
  if (record?.passwordHash) {
    allowed = password !== "" && (await verifyPassword(password, record.passwordHash));
  } else if (record) {
    // Tài khoản cũ (nhập từ Sheets) chưa có mật khẩu: KHÔNG có đường vào bằng mã. Thầy cần cấp mật khẩu (chưa có tính năng, xem AGENTS.md mục 11).
    return { status: "error", message: "Tài khoản này chưa có mật khẩu. Vui lòng liên hệ thầy để được cấp." };
  } else {
    await burnPasswordCheck(password);
  }
  if (!record || !allowed) return { status: "error", message: MSG_BAD_LOGIN };

  const profile = await getStudentProfile(record.id);
  if (profile.status !== "ok" || !profile.data) return { status: "error", message: "Chưa kiểm tra được. Vui lòng thử lại sau." };
  if (!(await startStudentSession(record.id))) return { status: "error", message: "Hệ thống chưa cấu hình phiên đăng nhập (thiếu sessionSecret)." };
  return { status: "ok", card: toCard(profile.data, record.role) };
}

export async function logoutAction(): Promise<void> {
  await endStudentSession();
}
