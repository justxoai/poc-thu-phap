"use server";

import { levelFor } from "@/data/gems";
import { getStudentProfile, normalizeCode } from "@/lib/firestore/students";
import { endStudentSession, startStudentSession } from "@/lib/session";
import type { StudentPublicProfile } from "@/lib/types";

/** Thông tin hiển thị cho chính học viên trong khung Minh Hồng. Không có SĐT/email/địa chỉ. */
export interface MemberCard {
  name: string;
  group: string;
  course: string;
  rank: number;
  level: string;
}

export type CodeCheckState = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; card: MemberCard };
export type LoginState = CodeCheckState;

const MSG_UNAVAILABLE = "Hệ thống chưa kết nối dữ liệu. Vui lòng thử lại sau.";

function toCard(profile: StudentPublicProfile): MemberCard {
  const rank = profile.stats.submissionCount + profile.stats.scoreSum;
  return { name: profile.name, group: profile.group, course: profile.course, rank, level: levelFor(rank) };
}

// POC-REWIND (4): chưa có rate limit/CAPTCHA, ai cũng dò được mã học viên qua hàm này (cần chặn ở hạ tầng hoặc đếm số lần thử).
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
 * "Tôi có mã học viên": Minh Hồng kiểm tra mã và cho xem thông tin nhanh. KHÔNG mở phiên đăng nhập
 * (quyết định đã chọn: mã chỉ để tra cứu nhanh; vào khu học viên phải đăng nhập bằng mật khẩu).
 */
export async function checkCodeAction(_prev: CodeCheckState, formData: FormData): Promise<CodeCheckState> {
  const found = await findStudent(formData);
  if ("error" in found) return { status: "error", message: found.error };
  return { status: "ok", card: toCard(found.profile) };
}

/**
 * "Đăng nhập tài khoản".
 * POC-REWIND (2): hiện CHỈ cần mã học viên hợp lệ, không kiểm tra mật khẩu.
 * Làm thật: nhận thêm `password`, so với `students/{id}.passwordHash` (scrypt, timing-safe), chậm vài trăm ms khi sai,
 * trả lỗi chung "Mã hoặc mật khẩu không đúng" (không cho biết mã có tồn tại), ép đổi mật khẩu nếu `mustChangePassword`.
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const found = await findStudent(formData);
  if ("error" in found) return { status: "error", message: found.error };
  await startStudentSession(found.code);
  return { status: "ok", card: toCard(found.profile) };
}

export async function logoutAction(): Promise<void> {
  await endStudentSession();
}
