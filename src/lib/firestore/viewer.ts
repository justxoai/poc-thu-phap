import "server-only";

import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import { normalizeCode } from "@/lib/firestore/students";
import type { Viewer } from "@/lib/session";
import type { DataResult } from "@/lib/types";

/**
 * Đọc người xem từ `students/{mã}`. CHỈ lấy các trường cần cho phân quyền; không đọc điện thoại/email/địa chỉ/ngày sinh.
 * `xp` = Rank = số bài hợp lệ + tổng điểm (cùng công thức bảng xếp hạng). `paid` = `students.paid === true` (chủ dự án đặt tay khi học viên mua gói).
 */
export function getViewerRecord(rawCode: unknown): Promise<DataResult<Viewer | null>> {
  const code = normalizeCode(rawCode);
  if (!code) return Promise.resolve({ status: "ok", data: null });
  return runQuery("viewer:get", async (db) => {
    const snap = await db.collection("students").doc(code).get();
    const d = snap.data();
    if (!snap.exists || !d) return null;
    const stats = (d.stats && typeof d.stats === "object" ? d.stats : {}) as Record<string, unknown>;
    return {
      studentId: snap.id,
      name: toText(d.name),
      group: toText(d.group),
      course: toText(d.course),
      xp: Math.max(0, toNumber(stats.submissionCount) + toNumber(stats.scoreSum)),
      paid: d.paid === true,
      role: "student" as const,
    };
  });
}
