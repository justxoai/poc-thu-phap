"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";

import "./admin-ui.css";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Khung popup dùng chung (khu quản trị): nền mờ, Esc hoặc bấm ra ngoài để đóng, khóa cuộn trang nền, giữ phím Tab trong popup.
 * Trả focus về nút đã mở popup khi đóng.
 */
export function DialogFrame({ title, onClose, size = "md", children }: { title: string; onClose: () => void; size?: "sm" | "md" | "lg"; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = box.current;
    node?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="ad-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ad-dialog ad-dialog-${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box}>
        <header className="ad-dialog-head">
          <h2>{title}</h2>
          <button type="button" className="ad-close" onClick={onClose} aria-label="Đóng">
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="ad-dialog-body">{children}</div>
      </div>
    </div>
  );
}

/** Popup mở bằng địa chỉ (?view=...): server dựng nội dung, đóng = quay về `closeHref` (giữ nguyên bộ lọc và trang). */
export function AdminDialog({ title, closeHref, size, children }: { title: string; closeHref: string; size?: "sm" | "md" | "lg"; children: ReactNode }) {
  const router = useRouter();
  const close = useCallback(() => router.push(closeHref, { scroll: false }), [router, closeHref]);
  return (
    <DialogFrame title={title} onClose={close} size={size}>
      {children}
    </DialogFrame>
  );
}
