"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Các khu có giao diện riêng toàn màn hình (thanh menu bên trái): không hiện TopBar/Header/Footer/Minh Hồng của website. */
const APP_AREAS = ["/admin/dashboard", "/student/dashboard"] as const;

export function isAppArea(path: string | null): boolean {
  return !!path && APP_AREAS.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Bọc phần khung dùng chung của website; trả về rỗng khi đang ở khu toàn màn hình. */
export function ChromeGate({ children }: { children: ReactNode }) {
  return isAppArea(usePathname()) ? null : <>{children}</>;
}
