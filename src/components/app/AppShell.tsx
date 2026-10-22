"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";

import "./app-shell.css";

export interface AppNavItem {
  id: string;
  href: string;
  label: string;
  icon: IconName;
}

export interface AppNavGroup {
  label?: string;
  items: AppNavItem[];
}

/**
 * Khung toàn màn hình cho khu quản trị và khu học viên: thanh menu bên trái, thanh tiêu đề trên, nội dung bên phải.
 * Trên điện thoại menu thành ngăn kéo mở bằng nút menu. `activeId` do trang truyền vào (khu thầy chọn mục bằng ?tab=);
 * không truyền thì mục nào có đường dẫn trùng đường dẫn hiện tại được coi là đang mở.
 */
export function AppShell({
  brand,
  subtitle,
  groups,
  activeId,
  user,
  footer,
  homeHref = "/",
  children,
}: {
  brand: string;
  subtitle: string;
  groups: AppNavGroup[];
  activeId?: string;
  user?: { name: string; note?: string; avatar?: ReactNode };
  /** Nút phụ cuối menu (đăng xuất...), do server dựng sẵn. */
  footer?: ReactNode;
  homeHref?: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path, activeId]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const all = groups.flatMap((g) => g.items);
  const current = all.find((i) => (activeId ? i.id === activeId : i.href.split("?")[0] === path)) ?? null;

  return (
    <div className={open ? "ap is-open" : "ap"}>
      <aside id="ap-side" className="ap-side" aria-label={`Menu ${subtitle}`}>
        <div className="ap-brand">
          <span className="ap-brand-mark" aria-hidden="true">
            書
          </span>
          <div>
            <strong>{brand}</strong>
            <small>{subtitle}</small>
          </div>
        </div>

        <nav className="ap-nav">
          {groups.map((group, i) => (
            <div key={group.label ?? i} className="ap-group">
              {group.label ? <div className="ap-group-label">{group.label}</div> : null}
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} aria-current={current?.id === item.id ? "page" : undefined}>
                      <span className="ap-icon" aria-hidden="true">
                        <Icon name={item.icon} size={18} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="ap-foot">
          {user ? (
            <div className="ap-user">
              {user.avatar ?? (
                <span className="ap-avatar" aria-hidden="true">
                  {user.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
              <div>
                <strong>{user.name}</strong>
                {user.note ? <small>{user.note}</small> : null}
              </div>
            </div>
          ) : null}
          {footer}
          <Link href={homeHref} className="ap-home">
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {open ? <button type="button" className="ap-scrim" aria-label="Đóng menu" onClick={() => setOpen(false)} /> : null}

      <div className="ap-main">
        <header className="ap-top">
          <button type="button" className="ap-burger" aria-controls="ap-side" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen((v) => !v)}>
            <Icon name="menu" size={20} />
          </button>
          <div className="ap-top-title">
            <small>{brand}</small>
            <strong>{subtitle}</strong>
          </div>
        </header>
        <div className="ap-content">{children}</div>
      </div>
    </div>
  );
}
