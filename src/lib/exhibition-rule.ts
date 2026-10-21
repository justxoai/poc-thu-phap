import { normalizeText } from "@/lib/text";

/**
 * Quy tắc "tác phẩm triển lãm" của site cũ (đọc từ mã trang Triển lãm, ngày 19/10/2026):
 * nhận xét của giáo viên có từ "ngon" đứng riêng (không phân biệt hoa/thường/dấu) và bài không thuộc loại bị loại.
 *
 * Bản mới KHÔNG quét toàn bộ bài nộp để lọc. Khi chấm bài (hoặc lúc nhập dữ liệu cũ), gọi hàm này một lần và ghi
 * `featured: true` vào document `homework` nếu đạt (bỏ hẳn trường nếu không đạt, để các index chỉ chứa bài triển lãm).
 */
export const EXHIBITION_KEYWORD = "ngon";

/** Mô tả bài có các cụm này thì không đưa vào triển lãm (bảng biểu, thu hoạch, lý thuyết). */
export const EXHIBITION_EXCLUDED = ["boi bieu", "thu hoach", "ly thuyet"] as const;

export function qualifiesForExhibition(work: { comment?: string; description?: string }): boolean {
  const comment = normalizeText(work.comment ?? "");
  if (!comment) return false;
  const words = comment.split(/[^a-z0-9]+/).filter(Boolean);
  if (!words.includes(EXHIBITION_KEYWORD)) return false;
  // Site cũ kiểm tra "mô tả bài" và một trường ghi chú riêng (chưa rõ nguồn); ở đây chỉ dùng mô tả bài.
  const description = normalizeText(work.description ?? "");
  return !EXHIBITION_EXCLUDED.some((keyword) => description.includes(keyword));
}
