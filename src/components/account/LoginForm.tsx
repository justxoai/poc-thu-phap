"use client";

import { useState } from "react";

import type { LoginState } from "@/app/minh-hong/actions";
import { PasswordField } from "@/components/account/PasswordField";

import "./account.css";

/** Ô đăng nhập trong khung Minh Hồng: mã học viên / email / SĐT + mật khẩu (có nút hiện/ẩn). */
export function LoginForm({ action, state, pending }: { action: (formData: FormData) => void; state: LoginState; pending: boolean }) {
  const [password, setPassword] = useState("");
  return (
    <form action={action} className="acc-mini">
      <div className="acc-field">
        <label htmlFor="login-identifier">Mã học viên, email hoặc số điện thoại</label>
        <input id="login-identifier" name="identifier" type="text" maxLength={120} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="TT00001 hoặc ten@gmail.com" required />
      </div>
      <PasswordField id="login-password" name="password" label="Mật khẩu" placeholder="Nhập mật khẩu" value={password} onChange={setPassword} autoComplete="current-password" required={false} />
      {state.status === "error" ? (
        <p className="acc-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="acc-primary" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
