import { normalizeText } from "@/lib/text";

/** Phần xử lý thuần (không phụ thuộc React/Firestore) của trang Triển lãm: lọc, sắp xếp, chia trang. */

export interface ViewWork {
  id: string;
  studentName: string;
  group: string;
  course: string;
  description: string;
  submittedAt: string;
}

export const PAGE_SIZES = [12, 24, 48] as const;
export const DEFAULT_PAGE_SIZE = 12;

export function isPageSize(value: number): value is (typeof PAGE_SIZES)[number] {
  return (PAGE_SIZES as readonly number[]).includes(value);
}

/** Tìm "chứa" (contains): không phân biệt hoa/thường, không phân biệt dấu; mọi từ trong ô tìm phải có mặt. */
export function matchesSearch(work: ViewWork, search: string): boolean {
  const words = normalizeText(search).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const hay = normalizeText(`${work.studentName} ${work.description} tổ ${work.group} khóa ${work.course}`);
  return words.every((w) => hay.includes(w));
}

export function sortWorks<T extends ViewWork>(works: T[], sort: "newest" | "oldest"): T[] {
  const dir = sort === "oldest" ? 1 : -1;
  return [...works].sort((a, b) => dir * (Date.parse(a.submittedAt) - Date.parse(b.submittedAt)) || a.id.localeCompare(b.id));
}

export function pageCountFor(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

export function pageSlice<T>(items: T[], page: number, size: number): T[] {
  const safe = Math.min(Math.max(1, page), pageCountFor(items.length, size));
  return items.slice((safe - 1) * size, safe * size);
}

/** Dãy nút số trang gọn: 1 … 4 5 [6] 7 8 … 20 ("…" là chỗ rút gọn). */
export function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}
