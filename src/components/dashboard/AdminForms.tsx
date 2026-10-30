"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import Link from "next/link";

import { GEMS } from "@/data/gems";
import { POST_LABELS } from "@/data/labels";
import { adjustWalletAction, placeStudentAction, orderStatusAction, restockAction, savePostAction, type AdminOpState } from "@/app/admin/dashboard/admin-actions";
import type { PostEditData } from "@/lib/firestore/admin-content";

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

/* ---------- Tin tức ---------- */

export function PostForm({ post, today, listHref }: { post: PostEditData | null; today: string; listHref: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useOp(savePostAction);
  // Lưu xong thì về danh sách, kèm thông báo (saved=new|edit) vì biểu mẫu sắp đóng.
  useEffect(() => {
    if (state.status === "ok") router.push(`${listHref}${listHref.includes("?") ? "&" : "?"}saved=${post ? "edit" : "new"}`);
  }, [state, router, listHref, post]);
  return (
    <form action={formAction} className="dash-form">
      <h2 className="dash-h2">{post ? "Sửa bài" : "Tạo tin tức mới"}</h2>
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
      <div className="dash-wide ad-form-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu bài"}
        </button>
        <Link href={listHref}>Hủy, về danh sách</Link>
      </div>
    </form>
  );
}

/* ---------- Xếp Tổ/Khóa ---------- */

export function PlaceStudentForm({ studentId }: { studentId: string }) {
  const [state, formAction, pending] = useOp(placeStudentAction);
  return (
    <form action={formAction} className="dash-inline">
      <input type="hidden" name="studentId" value={studentId} />
      <label>
        Khóa <input name="course" inputMode="numeric" maxLength={2} size={3} required aria-label={`Khóa của ${studentId}`} />
      </label>
      <label>
        Tổ <input name="group" inputMode="numeric" maxLength={2} size={3} required aria-label={`Tổ của ${studentId}`} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Xếp lớp"}
      </button>
      <Msg state={state} />
    </form>
  );
}
