"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "@/config/site";

/** Máy tính có chuột (rê chuột được) và đủ rộng để hiện menu ngang: rê chuột vào mục cha là mở danh sách con. */
const HOVER_QUERY = "(min-width: 900px) and (hover: hover)";
function canHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia(HOVER_QUERY).matches;
}

export function NavMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeAll = () => {
    setOpen(false);
    setSub(null);
  };

  // Danh sách con đang mở: bấm ra ngoài hoặc nhấn Esc thì đóng.
  useEffect(() => {
    if (sub === null) return;
    const onDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setSub(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSub(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sub]);

  return (
    <div className="nav-wrap" ref={wrapRef}>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">Menu</span>
        <span className="burger" aria-hidden="true" />
      </button>

      <nav id="main-nav" className={open ? "nav is-open" : "nav"} aria-label="Menu chính">
        <ul className="nav-list">
          {items.map((item) => {
            if (!item.children) {
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={closeAll}>
                    {item.label}
                  </Link>
                </li>
              );
            }
            const expanded = sub === item.href;
            return (
              <li
                key={item.href}
                className={expanded ? "has-children is-open" : "has-children"}
                onMouseEnter={() => canHover() && setSub(item.href)}
                onMouseLeave={() => canHover() && setSub(null)}
                onBlur={(event: FocusEvent<HTMLLIElement>) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSub(null);
                }}
              >
                {/* Mục cha chỉ mở danh sách con, không chuyển trang. Máy có chuột: bấm khi đang rê thì giữ mở. */}
                <button
                  type="button"
                  className="nav-parent"
                  aria-haspopup="true"
                  aria-expanded={expanded}
                  onClick={() => setSub((current) => (current === item.href ? (canHover() ? current : null) : item.href))}
                >
                  <span>{item.label}</span>
                  <Icon name="chevron-down" size={16} className="nav-caret" />
                </button>
                <ul className="nav-sub">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} onClick={closeAll}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
