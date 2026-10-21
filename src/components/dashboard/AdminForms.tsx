"use client";

import { useActionState } from "react";

import { GEMS, RARITIES } from "@/data/gems";
import { POST_LABELS } from "@/data/labels";
import { adjustWalletAction, gradeAction, orderStatusAction, restockAction, saveMarketItemAction, savePostAction, type AdminOpState } from "@/app/admin/dashboard/admin-actions";
import type { PostEditData } from "@/lib/firestore/admin-content";
import type { MarketItem, WorkItem } from "@/lib/types";

const IDLE: AdminOpState = { status: "idle" };

type Action = (prev: AdminOpState, formData: FormData) => Promise<AdminOpState>;

function Msg({ state }: { state: AdminOpState }) {
  return (
    <div role="status" aria-live="polite">
      {state.status === "error" ? <p className="dash-error">{state.message}</p> : null}
      {state.status === "ok" ? <p className="dash-ok">{state.message}</p> : null}
    </div>
  );
}

function useOp(action: Action) {
  return useActionState(action, IDLE);
}

/* ---------- Ngọc ---------- */

export function WalletAdjustForm() {
  const [state, formAction, pending] = useOp(adjustWalletAction);
  return (
    <form action={formAction} className="dash-form">
      <h2 className="dash-h2">Cộng / trừ ngọc</h2>
      <label>
        Mã học viên
        <input name="studentId" required maxLength={40} autoComplete="off" />
      </label>
      <label>
        Loại ngọc
        <select name="gem" defaultValue="hongNgoc">
          {GEMS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Số lượng (âm = trừ)
        <input name="amount" required inputMode="numeric" pattern="[+-]?[0-9]+" placeholder="vd. 5 hoặc -3" />
      </label>
      <label>
        Loại thao tác
        <select name="source" defaultValue="teacher_gift">
          <option value="teacher_gift">Thầy tặng (chỉ cộng)</option>
          <option value="admin_adjust">Điều chỉnh (cộng/trừ, cần lý do)</option>
        </select>
      </label>
      <label className="dash-wide">
        Ghi chú / lý do
        <input name="note" maxLength={200} />
      </label>
      <Msg state={state} />
      <button type="submit" disabled={pending}>
        {pending ? "Đang ghi..." : "Ghi vào sổ cái"}
      </button>
    </form>
  );
}

/* ---------- Chợ phiên ---------- */

export function MarketItemForm({ item }: { item?: MarketItem }) {
  const [state, formAction, pending] = useOp(saveMarketItemAction);
  return (
    <form action={formAction} className="dash-form">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label>
        Tên vật phẩm
        <input name="name" required maxLength={80} defaultValue={item?.name ?? ""} />
      </label>
      <label>
        Giá
        <input name="price" required inputMode="numeric" pattern="[0-9]+" defaultValue={item ? String(item.price) : ""} />
      </label>
      <label>
        Tính bằng
        <select name="currency" defaultValue={GEMS.find((g) => g.name === item?.currency)?.key ?? "hongNgoc"}>
          {GEMS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Độ hiếm
        <select name="rarity" defaultValue={item?.rarity || "phoThong"}>
          {RARITIES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tồn kho
        <input name="stock" required inputMode="numeric" pattern="[0-9]+" defaultValue={item ? String(item.stock) : "0"} />
      </label>
      <label>
        Ảnh (liên kết Drive, không bắt buộc)
        <input name="image" maxLength={500} defaultValue={item?.imageId ?? ""} />
      </label>
      <label className="dash-wide">
        Mô tả
        <textarea name="description" rows={2} maxLength={500} defaultValue={item?.description ?? ""} />
      </label>
      <label className="dash-check">
        <input type="checkbox" name="active" defaultChecked={item ? item.active : true} /> Đang bán
      </label>
      <Msg state={state} />
      <button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm vật phẩm"}
      </button>
    </form>
  );
}

export function RestockForm({ id }: { id: string }) {
  const [state, formAction, pending] = useOp(restockAction);
  return (
    <form action={formAction} className="dash-inline">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`rs-${id}`}>
        Nhập thêm
      </label>
      <input id={`rs-${id}`} name="delta" required inputMode="numeric" pattern="[+-]?[0-9]+" placeholder="+10" size={5} />
      <button type="submit" disabled={pending}>
        Nhập kho
      </button>
      <Msg state={state} />
    </form>
  );
}

const ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipped", label: "Đã gửi" },
  { value: "done", label: "Hoàn tất" },
];

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  const [state, formAction, pending] = useOp(orderStatusAction);
  return (
    <form action={formAction} className="dash-inline">
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`os-${id}`}>
        Trạng thái
      </label>
      <select id={`os-${id}`} name="status" defaultValue={ORDER_OPTIONS.some((o) => o.value === status) ? status : "new"}>
        {ORDER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending}>
        Lưu
      </button>
      <Msg state={state} />
    </form>
  );
}

/* ---------- Chấm bài ---------- */

export function GradeForm({ work }: { work: WorkItem }) {
  const [state, formAction, pending] = useOp(gradeAction);
  return (
    <form action={formAction} className="dash-inline">
      <input type="hidden" name="id" value={work.id} />
      <label className="sr-only" htmlFor={`gs-${work.id}`}>
        Điểm
      </label>
      <input id={`gs-${work.id}`} name="score" required inputMode="decimal" size={4} placeholder="0–10" defaultValue={work.score === null ? "" : String(work.score)} />
      <label className="sr-only" htmlFor={`gc-${work.id}`}>
        Nhận xét
      </label>
      <input id={`gc-${work.id}`} name="comment" maxLength={500} placeholder="Nhận xét" defaultValue={work.comment} />
      <button type="submit" disabled={pending}>
        {work.score === null ? "Chấm" : "Chấm lại"}
      </button>
      <Msg state={state} />
    </form>
  );
}

/* ---------- Tin tức ---------- */

export function PostForm({ post, today }: { post: PostEditData | null; today: string }) {
  const [state, formAction, pending] = useOp(savePostAction);
  return (
    <form action={formAction} className="dash-form">
      <h2 className="dash-h2">{post ? "Sửa bài" : "Đăng bài mới"}</h2>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <label className="dash-wide">
        Tiêu đề
        <input name="title" required maxLength={150} defaultValue={post?.title ?? ""} />
      </label>
      <label>
        Ngày đăng
        <input name="date" type="date" required defaultValue={post?.date || today} />
      </label>
      {post ? null : (
        <label>
          Đường dẫn (không bắt buộc)
          <input name="slug" maxLength={80} placeholder="tu-dong-tao-tu-tieu-de" />
        </label>
      )}
      <label>
        Trạng thái
        <select name="status" defaultValue={post?.status ?? "draft"}>
          <option value="draft">Nháp (chưa hiện)</option>
          <option value="published">Đăng</option>
        </select>
      </label>
      <label>
        Ảnh đại diện (Drive hoặc https)
        <input name="thumbnail" maxLength={500} defaultValue={post?.thumbnail ?? ""} />
      </label>
      <fieldset className="dash-wide dash-check-group">
        <legend>Chủ đề</legend>
        {POST_LABELS.map((label) => (
          <label key={label} className="dash-check">
            <input type="checkbox" name="labels" value={label} defaultChecked={post?.labels.includes(label) ?? false} /> {label}
          </label>
        ))}
      </fieldset>
      <label className="dash-wide">
        Tóm tắt
        <textarea name="summary" rows={2} maxLength={300} defaultValue={post?.summary ?? ""} />
      </label>
      <label className="dash-wide">
        Nội dung (HTML; được lọc trước khi lưu)
        <textarea name="html" rows={14} maxLength={200000} defaultValue={post?.html ?? ""} className="dash-code" />
      </label>
      <Msg state={state} />
      <button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu bài"}
      </button>
    </form>
  );
}
