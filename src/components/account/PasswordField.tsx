"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";

/** Ô mật khẩu có nút hiện/ẩn. Giá trị do component cha giữ (controlled) để kiểm tra khi nhập. */
export function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete: "new-password" | "current-password";
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="acc-field">
      <label htmlFor={id}>
        {label}
        {required ? <span className="acc-req" aria-hidden="true"> *</span> : null}
      </label>
      <div className="acc-pass">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          maxLength={100}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <button type="button" className="acc-eye" aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      </div>
      {error ? (
        <span id={`${id}-error`} className="acc-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
