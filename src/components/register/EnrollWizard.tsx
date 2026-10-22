"use client";

import { useActionState, useCallback, useEffect, useState } from "react";

import { loginAction, logoutAction, type LoginState } from "@/app/minh-hong/actions";
import { LoginForm } from "@/components/account/LoginForm";
import { RegisterAccountForm } from "@/components/account/RegisterAccountForm";
import { RegisterForm } from "@/components/register/RegisterForm";
import { Icon } from "@/components/ui/Icon";
import { announceSessionChange } from "@/lib/session-event";

import "@/components/account/account.css";

/** Dữ liệu /api/account (của chính người đăng nhập; SĐT/email đã che bớt). */
interface Account {
  code: string;
  name: string;
  group: string;
  course: string;
  rank: number;
  level: string;
  phoneMasked: string;
  emailMasked: string;
  hasContact: boolean;
}
type Me = { status: "loading" } | { status: "guest" } | { status: "in"; account: Account };
type Step = 1 | 2;

const STEPS = [
  { n: 1, label: "Tài khoản" },
  { n: 2, label: "Chọn khóa học" },
  { n: 3, label: "Nhập mã học viên" },
] as const;

const IDLE_LOGIN: LoginState = { status: "idle" };

/**
 * Đăng ký học theo 3 bước.
 *  Bước 1 Tài khoản: đã đăng nhập → hiện thông tin tài khoản; chưa → form tạo tài khoản (có lối "đã có tài khoản? đăng nhập").
 *  Bước 2 Chọn khóa học: chọn khóa + gói (thông tin cá nhân lấy từ tài khoản ở server).
 *  Bước 3 Nhập mã học viên: CHƯA MỞ.
 * Trang là tĩnh; trạng thái đăng nhập hỏi qua /api/account sau khi tải.
 */
export function EnrollWizard() {
  const [me, setMe] = useState<Me>({ status: "loading" });
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, IDLE_LOGIN);

  const refresh = useCallback(async (): Promise<Me> => {
    try {
      const res = await fetch("/api/account", { cache: "no-store" });
      const data = (await res.json()) as { loggedIn: boolean; account?: Account };
      const next: Me = data.loggedIn && data.account ? { status: "in", account: data.account } : { status: "guest" };
      setMe(next);
      return next;
    } catch {
      const next: Me = { status: "guest" };
      setMe(next);
      return next;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Vừa tạo tài khoản / đăng nhập xong: cập nhật và sang Bước 2. */
  const authed = useCallback(async () => {
    const next = await refresh();
    announceSessionChange();
    if (next.status === "in") setStep(2);
  }, [refresh]);

  useEffect(() => {
    if (loginState.status === "ok") void authed();
  }, [loginState, authed]);

  async function logout() {
    await logoutAction();
    setMe({ status: "guest" });
    setStep(1);
    setMode("login");
    announceSessionChange();
  }

  const loggedIn = me.status === "in";

  return (
    <div className="reg-wiz">
      <ol className="reg-wiz-steps" aria-label="Các bước đăng ký học">
        {STEPS.map(({ n, label }) => {
          const locked = n === 3;
          const reachable = n === 1 || (n === 2 && loggedIn);
          const state = locked ? "locked" : n === step ? "current" : n < step || (n === 1 && loggedIn) ? "done" : "todo";
          return (
            <li key={n} className={`reg-wiz-step is-${state}`} aria-current={n === step ? "step" : undefined}>
              <button type="button" disabled={!reachable} onClick={() => reachable && setStep(n as Step)}>
                <span className="reg-wiz-num" aria-hidden="true">
                  {state === "done" ? <Icon name="check" size={16} /> : state === "locked" ? <Icon name="lock" size={14} /> : n}
                </span>
                <span className="reg-wiz-label">
                  {label}
                  {locked ? <small>Chưa mở</small> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <section className="reg-wiz-panel" aria-label="Bước 1: Tài khoản">
          {me.status === "loading" ? <p className="reg-hint" role="status">Đang kiểm tra đăng nhập...</p> : null}

          {me.status === "in" ? (
            <div className="acc-card reg-acct">
              <h2>Tài khoản của bạn</h2>
              <p className="acc-lead">Bạn đã đăng nhập. Kiểm tra thông tin rồi tiếp tục chọn khóa học.</p>
              <dl className="reg-acct-grid">
                <div>
                  <dt>Họ và tên</dt>
                  <dd>{me.account.name || "—"}</dd>
                </div>
                <div>
                  <dt>Mã học viên</dt>
                  <dd>
                    <strong>{me.account.code}</strong>
                  </dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{me.account.phoneMasked || "—"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{me.account.emailMasked || "—"}</dd>
                </div>
                <div>
                  <dt>Tổ · Khóa</dt>
                  <dd>
                    {me.account.group || "Chưa xếp"} · {me.account.course || "Chưa xếp"}
                  </dd>
                </div>
                <div>
                  <dt>Rank</dt>
                  <dd>
                    {me.account.level} · {me.account.rank}
                  </dd>
                </div>
              </dl>
              {me.account.hasContact ? null : (
                <p className="acc-error acc-error-box" role="alert">
                  Tài khoản này chưa có số điện thoại hoặc email nên chưa đăng ký khóa được. Vui lòng gọi 0395 021 559 để được hỗ trợ.
                </p>
              )}
              <div className="reg-acct-actions">
                <button type="button" className="acc-primary" onClick={() => setStep(2)} disabled={!me.account.hasContact}>
                  Tiếp tục: chọn khóa học →
                </button>
                <button type="button" className="reg-back" onClick={logout}>
                  Dùng tài khoản khác (đăng xuất)
                </button>
              </div>
            </div>
          ) : null}

          {me.status === "guest" ? (
            mode === "register" ? (
              <>
                <RegisterAccountForm onCreated={authed} />
                <p className="reg-wiz-switch">
                  Đã có tài khoản?{" "}
                  <button type="button" onClick={() => setMode("login")}>
                    Đăng nhập
                  </button>
                </p>
              </>
            ) : (
              <div className="acc-card">
                <h2>Đăng nhập</h2>
                <p className="acc-lead">Dùng mã học viên, email hoặc số điện thoại cùng mật khẩu.</p>
                <LoginForm action={loginFormAction} state={loginState} pending={loginPending} />
                <p className="reg-wiz-switch">
                  Chưa có tài khoản?{" "}
                  <button type="button" onClick={() => setMode("register")}>
                    Tạo tài khoản mới
                  </button>
                </p>
              </div>
            )
          ) : null}
        </section>
      ) : null}

      {step === 2 && loggedIn ? (
        <section className="reg-wiz-panel" aria-label="Bước 2: Chọn khóa học">
          <RegisterForm onBack={() => setStep(1)} />
        </section>
      ) : null}
    </div>
  );
}
