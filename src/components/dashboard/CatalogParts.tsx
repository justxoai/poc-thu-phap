"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { saveCatalogItemAction, seedCatalogAction, type AdminOpState } from "@/app/admin/dashboard/admin-actions";
import { DialogFrame } from "@/components/dashboard/AdminDialog";
import { Icon } from "@/components/ui/Icon";
import type { CatalogKind } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/firestore/admin-catalog";

const IDLE: AdminOpState = { status: "idle" };

/** Popup thêm / sửa một mục trong danh mục bán (sách, loại ấn, khóa học, tài liệu). Lưu xong tự đóng. */
export function CatalogItemDialog({ kind, closeHref, item, title }: { kind: CatalogKind; closeHref: string; item?: CatalogItem; title: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveCatalogItemAction, IDLE);
  const close = () => router.push(closeHref, { scroll: false });
  useEffect(() => {
    if (state.status === "ok") router.push(closeHref, { scroll: false });
  }, [state, router, closeHref]);

  return (
    <DialogFrame title={item ? "Sửa mục" : title} size="md" onClose={close}>
      <form action={formAction} className="ad-form">
        <input type="hidden" name="kind" value={kind} />
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <label className="ad-field ad-wide">
          Tên
          <input name="name" required maxLength={120} defaultValue={item?.name ?? ""} />
        </label>
        <label className="ad-field ad-wide">
          Mô tả ngắn
          <textarea name="description" rows={2} maxLength={300} defaultValue={item?.description ?? ""} />
        </label>
        <label className="ad-field">
          Giá (đồng)
          <input name="price" required inputMode="numeric" pattern="[0-9]+" defaultValue={item ? String(item.price) : ""} />
        </label>
        <label className="ad-field ad-check">
          <input type="checkbox" name="active" defaultChecked={item ? item.active : true} /> Đang bán
        </label>
        <div role="status" aria-live="polite" className="ad-wide">
          {state.status === "error" ? <p className="dash-error">{state.message}</p> : null}
        </div>
        <div className="ad-confirm-actions ad-wide">
          <button type="button" className="ad-btn ad-btn-ghost" onClick={close}>
            Hủy
          </button>
          <button type="submit" className="ad-btn" disabled={pending}>
            {pending ? "Đang lưu..." : item ? "Lưu thay đổi" : title}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

/** Nút nạp các mục có sẵn trong code vào danh mục (chỉ thêm mục chưa có, không ghi đè). */
export function SeedCatalogButton({ kind, label }: { kind: CatalogKind; label: string }) {
  const [state, formAction, pending] = useActionState(seedCatalogAction, IDLE);
  return (
    <form action={formAction} className="ad-seed">
      <input type="hidden" name="kind" value={kind} />
      <button type="submit" className="ad-btn ad-btn-ghost" disabled={pending}>
        <Icon name="plus" size={16} /> {pending ? "Đang nạp..." : label}
      </button>
      <span role="status" aria-live="polite">
        {state.status === "error" ? <span className="dash-error">{state.message}</span> : null}
        {state.status === "ok" ? <span className="dash-ok">{state.message}</span> : null}
      </span>
    </form>
  );
}
