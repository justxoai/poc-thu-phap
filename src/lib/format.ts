/** Định dạng ngày giờ theo giờ Việt Nam: 19/10/2026 23:11:22 (không phụ thuộc múi giờ máy chủ/trình duyệt). */
const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatVnDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const p: Record<string, string> = {};
  for (const part of parts.formatToParts(date)) p[part.type] = part.value;
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

/** Điểm hiển thị gọn: 4 -> "4", 4.5 -> "4.5". */
export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : String(Math.round(score * 100) / 100);
}

/** 380000 -> "380.000đ". */
export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(amount))}đ`;
}
