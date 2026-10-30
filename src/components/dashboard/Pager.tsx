import Link from "next/link";

import { adminHref, pageRange, totalPages, type PageInfo } from "@/lib/admin-paging";

/**
 * Thanh phân trang: "Hiển thị a–b / tổng", "Trang p/N", Đầu / Trước / Sau. `params` là các bộ lọc đang áp dụng (không gồm tham số trang).
 * `memory` = danh sách cắt trong bộ nhớ (chỉ cần số trang); mặc định là phân trang theo con trỏ (after/before).
 */
export function Pager({ tab, params, info, memory = false }: { tab: string; params: Record<string, string | null | undefined>; info: PageInfo; memory?: boolean }) {
  const { from, to } = pageRange(info);
  const pages = totalPages(info);
  const base = { ...params, size: info.size };
  const first = adminHref(tab, base);
  const prev = memory ? adminHref(tab, { ...base, p: info.p - 1 }) : adminHref(tab, { ...base, before: info.first, p: info.p - 1 });
  const next = memory ? adminHref(tab, { ...base, p: info.p + 1 }) : adminHref(tab, { ...base, after: info.last, p: info.p + 1 });
  return (
    <nav className="ad-pager" aria-label="Phân trang">
      <span>{info.total === 0 ? "Không có dòng nào" : `Hiển thị ${from}–${to} / ${info.total}`}</span>
      <span className="ad-pager-links">
        {info.hasPrev ? <Link href={first}>« Đầu</Link> : <span aria-disabled="true">« Đầu</span>}
        {info.hasPrev ? <Link href={prev}>‹ Trước</Link> : <span aria-disabled="true">‹ Trước</span>}
        <strong>
          Trang {info.p}/{pages}
        </strong>
        {info.hasNext ? <Link href={next}>Sau ›</Link> : <span aria-disabled="true">Sau ›</span>}
      </span>
    </nav>
  );
}
