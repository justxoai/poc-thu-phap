"use server";

import { revalidatePath } from "next/cache";

import { parseDecor } from "@/data/decor";
import { saveDecor } from "@/lib/firestore/accounts";
import { getViewer } from "@/lib/session";
import { logError } from "@/lib/log-error";

export type SaveDecorState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

/** Học viên lưu trang trí của CHÍNH mình (mã học viên lấy từ phiên, không từ biểu mẫu). Chỉ nhận mã có trong data/decor.ts. */
export async function saveDecorAction(_prev: SaveDecorState, formData: FormData): Promise<SaveDecorState> {
  const viewer = await getViewer();
  if (!viewer) return { status: "error", message: "Bạn cần đăng nhập (nút Minh Hồng) trước." };
  const decor = parseDecor(formData.get("avatar"), formData.get("frame"), formData.get("background"));
  if (!decor) return { status: "error", message: "Lựa chọn chưa hợp lệ. Hãy chọn lại." };
  try {
    if ((await saveDecor(viewer.studentId, decor)) === "missing") return { status: "error", message: "Không tìm thấy hồ sơ." };
  } catch (error) {
    logError("decor", error);
    return { status: "error", message: "Chưa lưu được. Vui lòng thử lại sau." };
  }
  revalidatePath("/student/dashboard", "layout");
  return { status: "ok" };
}
