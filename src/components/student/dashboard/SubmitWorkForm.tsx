"use client";

import { useActionState } from "react";

import { submitWorkAction, type SubmitWorkState } from "@/app/student/dashboard/nop-bai/actions";

const IDLE: SubmitWorkState = { status: "idle" };

export function SubmitWorkForm() {
  const [state, formAction, pending] = useActionState(submitWorkAction, IDLE);
  return (
    <form action={formAction} className="sd-form">
      <label>
        Liên kết ảnh trên Google Drive
        <input name="link" type="url" required maxLength={500} placeholder="https://drive.google.com/file/d/..." inputMode="url" />
        <span className="sd-hint">Mở ảnh trên Drive, chọn Chia sẻ → “Bất kỳ ai có đường liên kết”, rồi dán liên kết vào đây.</span>
      </label>
      <label>
        Mô tả ngắn (không bắt buộc)
        <textarea name="description" rows={2} maxLength={200} />
      </label>
      <div className="sd-trap" aria-hidden="true">
        <label>
          Không điền ô này
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div role="status" aria-live="polite">
        {state.status === "error" ? <p className="sd-err">{state.message}</p> : null}
        {state.status === "ok" ? <p className="sd-ok">{state.duplicate ? "Ảnh này bạn đã nộp trước đó, không ghi thêm." : "Đã nhận bài. Thầy sẽ chấm sớm."}</p> : null}
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Đang gửi..." : "Nộp bài"}
      </button>
    </form>
  );
}
