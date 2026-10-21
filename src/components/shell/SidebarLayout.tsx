import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

/** Bố cục "nội dung + thanh bên" cho các trang con. Trang chủ và trang có UI riêng không cần dùng. */
export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container sidebar-layout">
      <div className="sidebar-main">{children}</div>
      <Sidebar />
    </div>
  );
}
