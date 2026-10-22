"use server";

import { extractDriveFileId } from "@/lib/drive";
import { HOMEWORK_PER_DAY, submitHomework } from "@/lib/firestore/submissions";
import { getViewer } from "@/lib/session";
import { cleanLine } from "@/lib/validation";

export type SubmitWorkState = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; duplicate: boolean };

/**
 * Học viên nộp bài (ảnh nằm ở Google Drive, chỉ lưu mã tệp). Học viên lấy từ PHIÊN, không từ biểu mẫu,
 * nên không nộp thay người khác được. Chưa có CAPTCHA/giới hạn theo IP; có giới hạn số bài mỗi ngày mỗi học viên.
 */
export async function submitWorkAction(_prev: SubmitWorkState, formData: FormData): Promise<SubmitWorkState> {
  if (cleanLine(formData.get("website"), 50) !== "") return { status: "ok", duplicate: false };

  const viewer = await getViewer();
  if (!viewer) return { status: "error", message: "Bạn cần đăng nhập (nút Minh Hồng) trước khi nộp bài." };

  if (!viewer.group || !viewer.course) return { status: "error", message: "Thầy chưa xếp Tổ/Khóa cho bạn nên chưa nộp bài được. Vui lòng chờ thầy xếp lớp." };

  const raw = formData.get("link");
  const fileId = typeof raw === "string" && raw.length <= 500 ? extractDriveFileId(raw) : null;
  if (!fileId) return { status: "error", message: "Chưa nhận ra liên kết Google Drive. Hãy dán liên kết chia sẻ của ảnh (drive.google.com/file/d/...)." };

  const description = cleanLine(formData.get("description"), 200);
  const result = await submitHomework({ studentId: viewer.studentId, studentName: viewer.name, group: viewer.group, course: viewer.course, driveFileId: fileId, description });
  if (result.status !== "ok") return { status: "error", message: "Hệ thống chưa nhận được bài. Vui lòng thử lại sau." };
  if (result.data === "limit") return { status: "error", message: `Hôm nay bạn đã nộp đủ ${HOMEWORK_PER_DAY} bài. Mời quay lại ngày mai.` };
  return { status: "ok", duplicate: result.data === "duplicate" };
}
