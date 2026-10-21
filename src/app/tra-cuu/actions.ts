"use server";

import { listGroupWorks, listStudentWorks } from "@/lib/firestore/homework";
import { getClassByCode, getStudentProfile, listGroupMembers, normalizeCode } from "@/lib/firestore/students";
import type { GroupMemberRow, StudentPublicProfile, WorkItem } from "@/lib/types";

export type StudentLookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; profile: StudentPublicProfile; works: WorkItem[] };

export type ClassLookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; group: string; course: string; members: GroupMemberRow[]; works: WorkItem[] };

const MSG_UNAVAILABLE = "Hệ thống chưa kết nối dữ liệu. Vui lòng thử lại sau.";
const MSG_FAILED = "Chưa tra cứu được. Vui lòng thử lại sau.";

/**
 * Tra cứu hồ sơ theo Mã học viên. Chỉ trả các trường công khai (xem mapStudent).
 * LƯU Ý: giống site cũ, mã học viên là thông tin duy nhất để xác minh. Cách đăng nhập chính thức chưa chốt (AGENTS.md).
 */
export async function lookupStudentAction(_prev: StudentLookupState, formData: FormData): Promise<StudentLookupState> {
  const raw = formData.get("code");
  if (typeof raw !== "string" || raw.trim() === "") return { status: "error", message: "Vui lòng nhập Mã học viên." };

  const code = normalizeCode(raw);
  if (!code) return { status: "error", message: "Mã học viên không hợp lệ." };

  const profile = await getStudentProfile(code);
  if (profile.status === "unconfigured") return { status: "error", message: MSG_UNAVAILABLE };
  if (profile.status === "error") return { status: "error", message: MSG_FAILED };
  if (!profile.data) return { status: "error", message: "Không tìm thấy học viên với mã này." };

  const works = await listStudentWorks(code, 50);
  return { status: "ok", profile: profile.data, works: works.status === "ok" ? works.data : [] };
}

/** Tra cứu cả tổ theo mã tra cứu của cán sự lớp (lưu trong `classCodes`). */
export async function lookupClassAction(_prev: ClassLookupState, formData: FormData): Promise<ClassLookupState> {
  const raw = formData.get("code");
  if (typeof raw !== "string" || raw.trim() === "") return { status: "error", message: "Vui lòng nhập mã tra cứu." };

  const code = normalizeCode(raw)?.toUpperCase();
  if (!code) return { status: "error", message: "Mã tra cứu không hợp lệ." };

  const cls = await getClassByCode(code);
  if (cls.status === "unconfigured") return { status: "error", message: MSG_UNAVAILABLE };
  if (cls.status === "error") return { status: "error", message: MSG_FAILED };
  if (!cls.data) return { status: "error", message: "Không tìm thấy mã tra cứu này." };

  const { group, course } = cls.data;
  const [members, works] = await Promise.all([listGroupMembers(group, course), listGroupWorks(group, course, 12)]);
  if (members.status !== "ok") return { status: "error", message: MSG_FAILED };
  return { status: "ok", group, course, members: members.data, works: works.status === "ok" ? works.data : [] };
}
