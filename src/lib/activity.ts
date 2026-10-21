import type { ActivityStatus, StudentStats } from "@/lib/types";

/** Quy tắc lấy từ trang cũ: số ngày kể từ bài hợp lệ gần nhất; 21 ngày là mốc cảnh báo. */
export const WARNING_DAYS = 21;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Điểm trung bình của các bài đã chấm, làm tròn 2 chữ số; chưa có bài chấm thì 0. */
export function averageScore(stats: Pick<StudentStats, "scoreSum" | "gradedCount">): number {
  if (stats.gradedCount <= 0) return 0;
  return Math.round((stats.scoreSum / stats.gradedCount) * 100) / 100;
}

export function activityStatus(lastSubmittedAt: string | null, now: Date = new Date()): ActivityStatus {
  if (!lastSubmittedAt) {
    return { level: "danger", text: "Chưa có bài hợp lệ", detail: "Không có bài hợp lệ để tính trạng thái." };
  }
  const last = new Date(lastSubmittedAt).getTime();
  if (Number.isNaN(last)) {
    return { level: "danger", text: "Chưa có bài hợp lệ", detail: "Không có bài hợp lệ để tính trạng thái." };
  }
  const days = Math.max(0, Math.floor((now.getTime() - last) / ONE_DAY_MS));
  if (days > WARNING_DAYS) {
    return { level: "danger", text: `Quá ${WARNING_DAYS} ngày`, detail: `Đã ${days} ngày chưa nộp bài hợp lệ.` };
  }
  if (days === WARNING_DAYS) {
    return { level: "warning", text: `Đúng ${WARNING_DAYS} ngày`, detail: `Đã ${WARNING_DAYS} ngày chưa nộp bài hợp lệ.` };
  }
  return { level: "active", text: "Đang hoạt động", detail: `Nộp bài hợp lệ gần nhất ${days} ngày trước.` };
}
