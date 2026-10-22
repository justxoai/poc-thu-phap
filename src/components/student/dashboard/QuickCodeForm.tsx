"use client";

import { useActionState, useState } from "react";

import { saveQuickCodeAction, type QuickCodeState } from "@/app/student/dashboard/ma-nhanh/actions";
import { DigitBoxes } from "@/components/ui/DigitBoxes";
import { Icon } from "@/components/ui/Icon";
import { QUICK_CODE_HINT, QUICK_CODE_LENGTH } from "@/lib/quick-code";

const IDLE: QuickCodeState = { status: "idle" };

/** Số ngẫu nhiên 6 chữ số bằng crypto của trình duyệt (chỉ gợi ý). */
function randomCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 10 ** QUICK_CODE_LENGTH).padStart(QUICK_CODE_LENGTH, "0");
}

/**
 * Đặt / đổi / xóa mã nhanh. Mã lưu dạng băm nên KHÔNG hiển thị lại: ô nhập luôn trống, chỉ nhập mã MỚI.
 * `hasCode` = đã có mã (để hiện "Đổi" và "Xóa").
 */
export function QuickCodeForm({ hasCode, maxFails, lockMinutes }: { hasCode: boolean; maxFails: number; lockMinutes: number }) {
  const [state, formAction, pending] = useActionState(saveQuickCodeAction, IDLE);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="qc-form">
      <span className="qc-label" id="quick-code-label">
        {hasCode ? "Mã nhanh mới" : "Mã nhanh"} ({QUICK_CODE_LENGTH} chữ số)
      </span>
      <input type="hidden" name="code" value={value} />
      <div className="qc-row">
        <DigitBoxes value={value} onChange={setValue} masked={!show} label="Mã nhanh" idPrefix="quick-code" />
        <button type="button" className="qc-eye-btn" onClick={() => setShow((v) => !v)} aria-label={show ? "Ẩn mã" : "Hiện mã"} aria-pressed={show}>
          <Icon name={show ? "eye-off" : "eye"} size={18} />
        </button>
      </div>
      <div className="qc-row">
        <button type="button" className="qc-random" onClick={() => { setValue(randomCode()); setShow(true); }}>
          Tạo ngẫu nhiên
        </button>
      </div>
      <p id="quick-code-hint" className="qc-hint">
        {QUICK_CODE_HINT} Hãy ghi nhớ mã: mã được lưu mã hóa nên không xem lại được, chỉ đặt được mã mới. Thầy không xem hay đổi được mã này. Đừng dùng ngày sinh hay dãy số dễ đoán. Nhập sai {maxFails} lần thì mã nhanh bị khóa {lockMinutes} phút (vẫn đăng nhập được bằng mật khẩu).
      </p>

      {state.status === "error" ? (
        <p className="qc-msg is-error" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === "ok" ? (
        <p className="qc-msg is-ok" role="status">
          {state.message}
        </p>
      ) : null}

      <div className="qc-actions">
        <button type="submit" className="qc-save" disabled={pending || value.length !== QUICK_CODE_LENGTH}>
          {pending ? "Đang lưu..." : hasCode ? "Đổi mã nhanh" : "Lưu mã nhanh"}
        </button>
        {hasCode ? (
          <button type="submit" name="intent" value="remove" className="qc-remove" disabled={pending} formNoValidate onClick={() => setValue("")}>
            Xóa mã
          </button>
        ) : null}
      </div>
    </form>
  );
}
