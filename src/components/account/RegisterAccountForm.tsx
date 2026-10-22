"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import { registerAccountAction, type RegisterAccountState } from "@/app/dang-ky/actions";
import { PasswordField } from "@/components/account/PasswordField";
import { Icon } from "@/components/ui/Icon";
import { validateAccountInput, type AccountField } from "@/lib/account-validation";

const INITIAL: RegisterAccountState = { status: "idle" };

type Values = Record<AccountField, string>;
const EMPTY: Values = { name: "", phone: "", email: "", birthDate: "", address: "", zaloName: "", password: "", confirmPassword: "" };
const ORDER: AccountField[] = ["name", "phone", "email", "birthDate", "address", "zaloName", "password", "confirmPassword"];

/** Tự chèn dấu "/" khi gõ ngày sinh (dd/mm/yyyy). Khi xóa thì để nguyên để sửa được. */
function formatBirthInput(previous: string, next: string): string {
  if (next.length < previous.length) return next.slice(0, 10);
  const digits = next.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter((p) => p !== "");
  return parts.join("/") + (digits.length === 2 || digits.length === 4 ? "/" : "");
}

/**
 * Biểu mẫu tạo tài khoản. Trình duyệt kiểm tra ngay khi rời ô (cùng bộ luật với server: lib/account-validation.ts);
 * server luôn kiểm tra lại. Bắt buộc: họ tên, SĐT, email, mật khẩu (+ nhập lại). Còn lại tùy chọn.
 */
export function RegisterAccountForm({ onCreated }: { onCreated?: () => void } = {}) {
  const [state, formAction, pending] = useActionState(registerAccountAction, INITIAL);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<AccountField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState<{ state: RegisterAccountState; fields: AccountField[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const createdOk = state.status === "ok" && state.loggedIn;

  // Dùng trong trang Đăng ký học: tạo xong (đã đăng nhập) thì báo cho bước tiếp theo.
  useEffect(() => {
    if (createdOk && onCreated) onCreated();
  }, [createdOk, onCreated]);

  if (state.status === "ok") {
    async function copy(code: string) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
    return (
      <div className="acc-card acc-success" role="status">
        <div className="acc-success-mark" aria-hidden="true">
          <Icon name="check" size={34} />
        </div>
        <h2>Đã tạo tài khoản</h2>
        <p>{state.name}, mã học viên của bạn là:</p>
        <p className="acc-code">
          <strong>{state.code}</strong>
          <button type="button" className="acc-copy" onClick={() => copy(state.code)} aria-label="Sao chép mã học viên">
            <Icon name="copy" size={18} /> {copied ? "Đã chép" : "Chép"}
          </button>
        </p>
        <p className="acc-note">Hãy lưu lại mã này. Tổ và Khóa sẽ do thầy xếp sau khi nhận hồ sơ; trong lúc chờ, bạn vẫn xem được hồ sơ của mình. Email của bạn chưa được xác minh.</p>
        <div className="acc-actions">
          {state.loggedIn ? (
            <Link className="acc-primary" href="/student/dashboard">
              Vào Dashboard học viên
            </Link>
          ) : (
            <p className="acc-note">Bạn có thể đăng nhập bằng nút Minh Hồng ở góc phải dưới.</p>
          )}
        </div>
      </div>
    );
  }

  const check = validateAccountInput(values);
  const clientErrors = check.ok ? {} : check.errors;
  const serverErrors = state.status === "error" ? state.fields : {};

  function errorOf(field: AccountField): string | undefined {
    const server = serverErrors[field];
    const serverDismissed = dismissed?.state === state && dismissed.fields.includes(field);
    if (server && !serverDismissed) return server;
    return touched[field] || submitted ? clientErrors[field] : undefined;
  }

  function set(field: AccountField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setDismissed((d) => ({ state, fields: d && d.state === state ? [...d.fields, field] : [field] }));
  }
  const blur = (field: AccountField) => () => setTouched((t) => ({ ...t, [field]: true }));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setSubmitted(true);
    if (!check.ok) {
      event.preventDefault();
      const firstBad = ORDER.find((f) => check.errors[f]);
      if (firstBad) formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
    }
  }

  const text = (field: AccountField, label: string, placeholder: string, opts: { type?: string; autoComplete: string; required?: boolean; inputMode?: "numeric" | "tel" | "email"; maxLength: number; hint?: string }) => {
    const error = errorOf(field);
    return (
      <div className="acc-field">
        <label htmlFor={`acc-${field}`}>
          {label}
          {opts.required ? <span className="acc-req" aria-hidden="true"> *</span> : null}
        </label>
        <input
          id={`acc-${field}`}
          name={field}
          type={opts.type ?? "text"}
          value={values[field]}
          placeholder={placeholder}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          required={opts.required}
          maxLength={opts.maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `acc-${field}-error` : undefined}
          onChange={(e) => set(field, field === "birthDate" ? formatBirthInput(values.birthDate, e.target.value) : e.target.value)}
          onBlur={blur(field)}
        />
        {opts.hint && !error ? <span className="acc-hint">{opts.hint}</span> : null}
        {error ? (
          <span id={`acc-${field}-error`} className="acc-error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="acc-card" noValidate>
      <h2>Tạo tài khoản học viên</h2>
      <p className="acc-lead">Điền thông tin để nhận mã học viên. Các ô có dấu * là bắt buộc.</p>

      <div className="acc-trap" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {text("name", "Họ và tên", "Nguyễn Văn A", { autoComplete: "name", required: true, maxLength: 80 })}
      {text("phone", "Số điện thoại", "0912345678 hoặc +84912345678", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true, maxLength: 20 })}
      {text("email", "Email", "ten@gmail.com", { type: "email", autoComplete: "email", inputMode: "email", required: true, maxLength: 120 })}
      {text("birthDate", "Ngày tháng năm sinh", "dd/mm/yyyy", { autoComplete: "bday", inputMode: "numeric", maxLength: 10 })}
      {text("address", "Địa chỉ", "Tỉnh/Thành phố", { autoComplete: "address-level1", maxLength: 120 })}
      {text("zaloName", "Tên Zalo", "Tên hiển thị trên Zalo của bạn", { autoComplete: "off", maxLength: 60 })}

      <PasswordField
        id="acc-password"
        name="password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự"
        value={values.password}
        onChange={(v) => set("password", v)}
        onBlur={blur("password")}
        error={errorOf("password")}
        autoComplete="new-password"
      />
      <PasswordField
        id="acc-confirm"
        name="confirmPassword"
        label="Nhập lại mật khẩu"
        placeholder="Nhập lại mật khẩu"
        value={values.confirmPassword}
        onChange={(v) => set("confirmPassword", v)}
        onBlur={blur("confirmPassword")}
        error={errorOf("confirmPassword")}
        autoComplete="new-password"
      />

      {state.status === "error" && state.message ? (
        <p className="acc-error acc-error-box" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="acc-primary" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo tài khoản"}
      </button>
      {onCreated ? null : (
        <p className="acc-foot">
          Muốn đăng ký khóa học? Xem trang <Link href="/dang-ky-hoc">Đăng ký học</Link>.
        </p>
      )}
    </form>
  );
}
