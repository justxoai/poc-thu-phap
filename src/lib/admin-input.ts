import { extractDriveFileId } from "@/lib/drive";
import { normalizeText } from "@/lib/text";

/** Điểm 0–10, tối đa 1 chữ số thập phân ("8", "8.5", "8,5"). Sai -> null. */
export function parseScore(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().replace(",", ".");
  if (!/^\d{1,2}(\.\d)?$/.test(text)) return null;
  const n = Number(text);
  return n >= 0 && n <= 10 ? n : null;
}

/** Số nguyên có dấu (cho phép "-"), |n| <= max. Không nhận số thập phân, "1e3", khoảng trắng giữa. */
export function parseSignedInt(raw: unknown, max: number): number | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!/^[+-]?\d{1,9}$/.test(text)) return null;
  const n = Number(text);
  return Math.abs(n) <= max ? n : null;
}

/** "Thông báo mới!" -> "thong-bao-moi". Rỗng nếu không còn ký tự hợp lệ. */
export function slugFromTitle(title: string): string {
  const slug = normalizeText(title).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/g, "");
  return slug;
}

/** "yyyy-mm-dd" hợp lệ -> 12:00 giờ Việt Nam của ngày đó; sai -> null. */
export function parseVnDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return null;
  // Loại ngày không có thật như 2026-02-31 (Date tự nhảy sang tháng sau).
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }) === raw ? d : null;
}

export function vnDateString(date: Date): string {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** Ảnh đại diện bài viết: bỏ trống, mã/liên kết Drive hoặc địa chỉ https. Sai -> null (khác với rỗng ""). */
export function parseThumbnail(raw: unknown): string | null {
  if (typeof raw !== "string") return "";
  const text = raw.trim();
  if (!text) return "";
  const drive = extractDriveFileId(text);
  if (drive) return drive;
  try {
    const url = new URL(text);
    return url.protocol === "https:" && text.length <= 500 ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Số nguyên không âm tối đa 9 chữ số, 0 <= n <= max. */
export function parseNonNegInt(raw: unknown, max: number): number | null {
  if (typeof raw !== "string" || !/^\d{1,9}$/.test(raw.trim())) return null;
  const n = Number(raw);
  return n <= max ? n : null;
}
