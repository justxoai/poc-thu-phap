import { normalizeText } from "@/lib/text";

/** Chủ đề (nhãn) bài viết, theo khối "CHỦ ĐỀ" của site cũ. */
export const POST_LABELS = [
  "Ấn triện",
  "Danh Nhân",
  "Kiến thức",
  "Nhiệm vụ",
  "Reviews",
  "Tài Liệu",
  "Thủy Mặc",
  "Thư pháp Hán",
  "Thư pháp Việt",
  "Thư Phổ",
  "Videos",
] as const;

export function labelSlug(label: string): string {
  return normalizeText(label).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function labelFromSlug(slug: string): string | null {
  return POST_LABELS.find((l) => labelSlug(l) === slug) ?? null;
}
