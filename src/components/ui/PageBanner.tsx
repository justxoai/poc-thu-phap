import type { ReactNode } from "react";

import "./page-banner.css";

/** Banner đầu trang: nhãn nhỏ, tiêu đề, (tùy chọn) mô tả và nội dung thêm. Dùng cho các trang tra cứu và Phiên chợ. */
export function PageBanner({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="pb">
      <p className="pb-mark">THANH PHONG THƯ MÔN</p>
      <h1>{title}</h1>
      {lead ? <p className="pb-lead">{lead}</p> : null}
      {children}
      <div className="pb-line" aria-hidden="true" />
    </header>
  );
}
