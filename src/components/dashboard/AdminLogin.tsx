"use client";

import { useActionState } from "react";

import { adminLoginAction, type AdminLoginState } from "@/app/admin/dashboard/actions";

const INITIAL: AdminLoginState = { status: "idle" };

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(adminLoginAction, INITIAL);
  return (
    <form action={formAction} className="dash-login">
      <h1>Quản trị</h1>
      <p>Nhập khóa quản trị để xem dữ liệu.</p>
      <label className="sr-only" htmlFor="dash-key">
        Khóa quản trị
      </label>
      <input id="dash-key" name="key" type="password" autoComplete="off" maxLength={200} required placeholder="Khóa quản trị" />
      <div role="alert" aria-live="assertive">
        {state.status === "error" ? <p className="dash-error">{state.message}</p> : null}
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "Đang kiểm tra..." : "Đăng nhập"}
      </button>
    </form>
  );
}
