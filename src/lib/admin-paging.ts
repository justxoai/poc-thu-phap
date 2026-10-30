/**
 * Phân trang dùng chung cho các danh sách ở khu quản trị. Thuần hàm (không đụng Firestore) nên dùng được cả ở server lẫn client.
 * Trạng thái nằm trên địa chỉ: `size` (số dòng/trang), `p` (số trang, chỉ để hiển thị), `after`/`before` (con trỏ trang kế/trước).
 * Con trỏ do từng danh sách tự định nghĩa và tự kiểm tra; ở đây chỉ giới hạn độ dài và ký tự.
 */
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

export interface PageRequest {
  size: PageSize;
  p: number;
  after: string | null;
  before: string | null;
}

export interface PageInfo {
  p: number;
  size: PageSize;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  /** Con trỏ của dòng đầu / dòng cuối trang hiện tại (dùng làm `before` / `after` của trang trước / sau). */
  first: string | null;
  last: string | null;
  /** Số dòng thực có ở trang này. */
  count: number;
}

type Raw = string | string[] | undefined;
const one = (v: Raw): string | undefined => (Array.isArray(v) ? v[0] : v);
const CURSOR_OK = /^[^\u0000-\u001f]{1,240}$/;

export function parsePageRequest(params: { size?: Raw; p?: Raw; after?: Raw; before?: Raw }): PageRequest {
  const size = PAGE_SIZES.find((s) => String(s) === one(params.size)) ?? DEFAULT_PAGE_SIZE;
  const p = Math.min(100_000, Math.max(1, Math.floor(Number(one(params.p))) || 1));
  const after = one(params.after);
  const before = one(params.before);
  const cleanAfter = after && CURSOR_OK.test(after) ? after : null;
  const cleanBefore = !cleanAfter && before && CURSOR_OK.test(before) ? before : null;
  return { size, p: cleanAfter || cleanBefore ? p : 1, after: cleanAfter, before: cleanBefore };
}

/** Địa chỉ trang quản trị với các tham số (bỏ tham số rỗng/null). */
export function adminHref(tab: string, params: Record<string, string | number | null | undefined> = {}): string {
  const q = new URLSearchParams({ tab });
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== "") q.set(k, String(v));
  return `/admin/dashboard?${q.toString()}`;
}

export function pageRange(info: PageInfo): { from: number; to: number } {
  if (info.count === 0) return { from: 0, to: 0 };
  const from = (info.p - 1) * info.size + 1;
  return { from, to: from + info.count - 1 };
}

export function totalPages(info: Pick<PageInfo, "total" | "size">): number {
  return Math.max(1, Math.ceil(info.total / info.size));
}

/** Cắt một mảng đã có sẵn trong bộ nhớ thành trang (danh sách ngắn như Lớp). */
export function sliceMemoryPage<T>(rows: T[], req: { size: PageSize; p: number }): { rows: T[]; info: PageInfo } {
  const pages = Math.max(1, Math.ceil(rows.length / req.size));
  const p = Math.min(req.p, pages);
  const start = (p - 1) * req.size;
  const slice = rows.slice(start, start + req.size);
  return { rows: slice, info: { p, size: req.size, total: rows.length, hasPrev: p > 1, hasNext: p < pages, first: null, last: null, count: slice.length } };
}
