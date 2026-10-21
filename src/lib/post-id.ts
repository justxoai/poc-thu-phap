/**
 * Bài viết giữ nguyên địa chỉ của Blogger để không gãy liên kết cũ: /2026/10/thong-bao-moi.html -> /2026/10/thong-bao-moi.
 * Id tài liệu Firestore `posts/{id}` = "<năm>-<tháng>_<slug>", ví dụ "2026-10_thong-bao-moi".
 */
const YEAR = /^\d{4}$/;
const MONTH = /^(0[1-9]|1[0-2])$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;
const ID = /^(\d{4})-(0[1-9]|1[0-2])_([a-z0-9][a-z0-9-]{0,119})$/;

export function postDocId(year: string, month: string, slug: string): string | null {
  const clean = slug.replace(/\.html$/i, "").toLowerCase();
  return YEAR.test(year) && MONTH.test(month) && SLUG.test(clean) ? `${year}-${month}_${clean}` : null;
}

export function parsePostId(id: string): { year: string; month: string; slug: string } | null {
  const match = ID.exec(id);
  return match ? { year: match[1], month: match[2], slug: match[3] } : null;
}

export function postHref(id: string): string | null {
  const parts = parsePostId(id);
  return parts ? `/${parts.year}/${parts.month}/${parts.slug}` : null;
}
