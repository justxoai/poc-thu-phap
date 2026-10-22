"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { loginAction, type LoginState } from "@/app/minh-hong/actions";
import { LoginForm } from "@/components/account/LoginForm";
import { announceSessionChange } from "@/lib/session-event";

const INITIAL: LoginState = { status: "idle" };

/**
 * Đăng nhập vào khu thầy bằng CHÍNH tài khoản học viên (mã/email/SĐT + mật khẩu). Quyền quản trị do `role` của tài khoản quyết định,
 * không phải do ô này: đăng nhập xong mà không phải admin thì trang vẫn từ chối.
 */
export function AdminLogin() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  useEffect(() => {
    if (state.status === "ok") {
      announceSessionChange();
      router.refresh();
    }
  }, [state, router]);
  return (
    <div className="dash-login">
      <h1>Quản trị</h1>
      <p>Đăng nhập bằng tài khoản quản trị của thầy.</p>
      <LoginForm action={formAction} state={state} pending={pending} />
    </div>
  );
}
