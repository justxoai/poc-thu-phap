"use client";

import Link from "next/link";
import { useState } from "react";

import type { NavItem } from "@/config/site";

export function NavMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="nav-wrap">
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
          {items.map((item) => (
            <li key={item.href} className={item.children ? "has-children" : undefined}>
              <Link href={item.href} onClick={close}>
                {item.label}
              </Link>
              {item.children ? (
                <ul className="nav-sub">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} onClick={close}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
