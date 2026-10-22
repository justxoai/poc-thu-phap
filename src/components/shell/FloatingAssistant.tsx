"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";

import { checkCodeAction, loginAction, logoutAction, quickLoginAction, type CodeCheckState, type LoginState, type MemberCard } from "@/app/minh-hong/actions";
import { LoginForm } from "@/components/account/LoginForm";
import { DigitBoxes } from "@/components/ui/DigitBoxes";
import { Icon } from "@/components/ui/Icon";
import { SESSION_EVENT } from "@/lib/session-event";

import "./assistant.css";

/**
 * Trợ lý nổi "Minh Hồng": khung có đầu (ảnh, tên, nút đóng), thân, chân.
 * - Khách (chưa đăng nhập): "Bắt đầu" với 4 lối vào (có mã học viên / đăng nhập / tạo tài khoản / người mới).
 *   "Tôi đã có mã học viên": nhập mã TTxxxxx -> hiện thông tin đơn giản -> nhập mã nhanh (6 số) -> được tính là đăng nhập.
 * - Học viên đã đăng nhập: lời chào, "Vào Dashboard của bạn", "Rao bán vật phẩm cho Minh Hồng", "Đăng xuất".
 *   Riêng role admin có thêm "Vào Dashboard quản trị" (quyền thật vẫn được kiểm tra ở server).
 * Trạng thái đăng nhập lấy từ /api/session khi mở khung (layout không đọc cookie để trang vẫn tĩnh).
 *
 * Đăng nhập: mã/email/SĐT + mật khẩu. Còn thiếu: liên kết "Quên/đổi mật khẩu".
 * POC: "Rao bán vật phẩm cho Minh Hồng" tạm dẫn tới /cho-phien (chưa có tính năng rao bán riêng).
 */

type View = "menu" | "code" | "login" | "newbie";
type Me = { status: "loading" } | { status: "guest" } | { status: "in"; card: MemberCard };

const IDLE: CodeCheckState = { status: "idle" };
const IDLE_LOGIN: LoginState = { status: "idle" };

const NEWBIE_LINKS: { href: string; label: string }[] = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/huong-dan", label: "Hướng dẫn" },
  { href: "/dang-ky-hoc", label: "Đăng ký học" },
  { href: "/sach-thu-phap", label: "Mua sách" },
  { href: "/trien-lam", label: "Phòng triển lãm" },
  { href: "/hoi-dap", label: "Hỏi đáp nhanh" },
];

function Card({ card }: { card: MemberCard }) {
  return (
    <dl className="assistant-card">
      <div>
        <dt>Học viên</dt>
        <dd>{card.name}</dd>
      </div>
      <div>
        <dt>Tổ · Khóa</dt>
        <dd>
          {card.group || "—"} · {card.course || "—"}
        </dd>
      </div>
      <div>
        <dt>Rank</dt>
        <dd>{card.rank}</dd>
      </div>
      <div>
        <dt>Cấp bậc</dt>
        <dd>{card.level}</dd>
      </div>
    </dl>
  );
}

/** Bước 1: nhập mã học viên (TTxxxxx). */
function CodeForm({ action, state, pending }: { action: (formData: FormData) => void; state: CodeCheckState; pending: boolean }) {
  return (
    <form action={action} className="assistant-form">
      <label>
        <span>Mã học viên</span>
        <input name="code" type="text" maxLength={40} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="TT00001" required />
      </label>
      {state.status === "error" ? (
        <p className="assistant-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "Đang kiểm tra..." : "Kiểm tra mã"}
      </button>
    </form>
  );
}

/**
 * Bước 2: nhập mã nhanh (6 ô số) đi cùng mã học viên đã kiểm tra ở bước 1. Đúng thì được tính là đăng nhập.
 * `available=false` (chưa đặt mã nhanh / tài khoản quản trị): vẫn hiện 6 ô nhưng khóa, kèm lời nhắc dùng mật khẩu.
 */
function QuickLoginForm({ code, available, action, state, pending }: { code: string; available: boolean; action: (formData: FormData) => void; state: LoginState; pending: boolean }) {
  const [quick, setQuick] = useState("");
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="assistant-form">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="quick" value={quick} />
      <div className="assistant-quick">
        <div className="assistant-quick-head">
          <span id="quick-label">Mã nhanh</span>
          <button type="button" className="assistant-eye" onClick={() => setShow((v) => !v)} disabled={!available} aria-label={show ? "Ẩn mã nhanh" : "Hiện mã nhanh"} aria-pressed={show}>
            <Icon name={show ? "eye-off" : "eye"} size={16} />
          </button>
        </div>
        <DigitBoxes value={quick} onChange={setQuick} masked={!show} disabled={!available} label="Mã nhanh" idPrefix="assistant-quick" />
      </div>
      {!available ? (
        <p className="assistant-note">
          Học viên này chưa đặt mã nhanh. Hãy chọn “Đăng nhập tài khoản” bằng mật khẩu, rồi vào Dashboard, mục “Mã nhanh” để đặt.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="assistant-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending || !available || quick.length !== 6}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}

/** "Tôi đã có mã học viên": bước 1 (mã học viên -> thông tin) rồi bước 2 (mã nhanh -> đăng nhập). Rời màn này thì trạng thái được xóa. */
function CodeFlow({ onLoggedIn }: { onLoggedIn: (card: MemberCard) => void }) {
  const [codeState, codeAction, codePending] = useActionState(checkCodeAction, IDLE);
  const [quickState, quickFormAction, quickPending] = useActionState(quickLoginAction, IDLE_LOGIN);

  useEffect(() => {
    if (quickState.status === "ok") onLoggedIn(quickState.card);
  }, [quickState, onLoggedIn]);

  // Bước 1 (nhập mã học viên) chỉ hiện đến khi mã hợp lệ; sau đó màn hình chỉ còn thẻ thông tin + 6 ô mã nhanh.
  if (codeState.status === "ok") {
    return (
      <div className="assistant-step2">
        <Card card={codeState.card} />
        <QuickLoginForm code={codeState.code} available={codeState.quickLogin} action={quickFormAction} state={quickState} pending={quickPending} />
      </div>
    );
  }
  return (
    <>
      <p className="assistant-lead">Nhập mã học viên của bạn (dạng TT00001). Minh Hồng sẽ hiện thông tin và hỏi mã nhanh để đăng nhập.</p>
      <CodeForm action={codeAction} state={codeState} pending={codePending} />
    </>
  );
}

export function FloatingAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [me, setMe] = useState<Me>({ status: "loading" });
  const [asked, setAsked] = useState(false);

  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, IDLE_LOGIN);

  // Hỏi trạng thái đăng nhập một lần, lần đầu mở khung.
  useEffect(() => {
    if (!open || asked) return;
    setAsked(true);
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { loggedIn: boolean; card?: MemberCard }) => setMe(data.loggedIn && data.card ? { status: "in", card: data.card } : { status: "guest" }))
      .catch(() => setMe({ status: "guest" }));
  }, [open, asked]);

  // Nơi khác (trang Đăng ký học) vừa đăng nhập/đăng xuất: hỏi lại trạng thái ở lần mở khung tới.
  useEffect(() => {
    const onChange = () => {
      setAsked(false);
      setMe({ status: "loading" });
    };
    window.addEventListener(SESSION_EVENT, onChange);
    return () => window.removeEventListener(SESSION_EVENT, onChange);
  }, []);

  // Đăng nhập xong: cập nhật khung và làm mới trang hiện tại để mở khóa nội dung.
  useEffect(() => {
    if (loginState.status === "ok") {
      setMe({ status: "in", card: loginState.card });
      setView("menu");
      router.refresh();
    }
  }, [loginState, router]);

  const onQuickLoggedIn = useCallback(
    (card: MemberCard) => {
      setMe({ status: "in", card });
      setView("menu");
      router.refresh();
    },
    [router],
  );

  async function logout() {
    await logoutAction();
    setMe({ status: "guest" });
    setView("menu");
    router.refresh();
  }

  const close = () => setOpen(false);

  // Nhấn Esc để đóng khung.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const back = (
    <button type="button" className="assistant-back" onClick={() => setView("menu")}>
      ← Quay lại
    </button>
  );

  return (
    <div className="assistant">
      {open ? (
        <div className="assistant-panel" role="dialog" aria-label="Trợ lý Minh Hồng">
          <header className="assistant-head">
            <span className="assistant-head-avatar">
              <Image src="/images/minh-hong.png" alt="" width={44} height={44} />
            </span>
            <div className="assistant-head-text">
              <p className="assistant-title">Minh Hồng</p>
              <p className="assistant-sub">Trợ giảng Online · Hướng dẫn và thông báo</p>
            </div>
            <button type="button" className="assistant-close" aria-label="Đóng" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </header>

          <div className="assistant-body">
            {view === "menu" ? (
              me.status === "in" ? (
                <>
                  <h2 className="assistant-heading">Chào mừng học viên {me.card.name} quay lại.</h2>
                  <div className="assistant-actions">
                    <Link href="/student/dashboard" className="assistant-action is-primary" onClick={close}>
                      <span>Vào Dashboard của bạn</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </Link>
                    {me.card.role === "admin" ? (
                      <Link href="/admin/dashboard" className="assistant-action" onClick={close}>
                        <span>Vào Dashboard quản trị</span>
                        <span className="assistant-arrow" aria-hidden="true">→</span>
                      </Link>
                    ) : null}
                    <Link href="/cho-phien" className="assistant-action" onClick={close}>
                      <span>Rao bán vật phẩm cho Minh Hồng</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </Link>
                    <button type="button" className="assistant-action" onClick={logout}>
                      <span>Đăng xuất</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="assistant-heading">Chào bạn, mình là Minh Hồng.</h2>
                  <p className="assistant-lead">
                    Mình là trợ giảng Online của website. Nếu bạn đã có mã học viên, nhập mã rồi mã nhanh (do bạn tự đặt trong Dashboard) để vào nhanh, hoặc đăng nhập bằng tài khoản.
                  </p>
                  <p className="assistant-label">Bắt đầu</p>
                  <div className="assistant-actions">
                    <button type="button" className="assistant-action is-primary" onClick={() => setView("code")}>
                      <span>Tôi đã có mã học viên</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </button>
                    <button type="button" className="assistant-action" onClick={() => setView("login")}>
                      <span>Đăng nhập tài khoản</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </button>
                    <Link href="/dang-ky" className="assistant-action" onClick={close}>
                      <span>Tạo tài khoản mới</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </Link>
                    <button type="button" className="assistant-action" onClick={() => setView("newbie")}>
                      <span>Tôi là người mới</span>
                      <span className="assistant-arrow" aria-hidden="true">→</span>
                    </button>
                  </div>
                </>
              )
            ) : null}

            {view === "code" ? (
              <>
                {back}
                <CodeFlow onLoggedIn={onQuickLoggedIn} />
              </>
            ) : null}

            {view === "login" ? (
              <>
                {back}
                <p className="assistant-lead">Đăng nhập để mở khóa nhiệm vụ, giảng đường và video xem lại.</p>
                <LoginForm action={loginFormAction} state={loginState} pending={loginPending} />
                <p className="assistant-note">
                  Chưa có tài khoản?{" "}
                  <Link href="/dang-ky" onClick={close}>
                    Tạo tài khoản mới
                  </Link>
                </p>
              </>
            ) : null}

            {view === "newbie" ? (
              <>
                {back}
                <p className="assistant-lead">
                  Đây là website của Việt Thư Đạo Quán và lớp thư pháp online Thanh Phong Thư Môn: tin bài, hướng dẫn thực hành, đăng ký học, nộp bài và nhiều hoạt động cho học viên. Bạn có thể bắt đầu từ đây:
                </p>
                <div className="assistant-links">
                  {NEWBIE_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} onClick={close}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <footer className="assistant-foot">Minh Hồng · Trợ giảng Online</footer>
        </div>
      ) : null}

      <button type="button" className="assistant-launcher" aria-expanded={open} aria-label={open ? "Đóng trợ lý Minh Hồng" : "Mở trợ lý Minh Hồng"} onClick={() => setOpen((value) => !value)}>
        <span className="assistant-avatar">
          <Image src="/images/minh-hong.png" alt="" width={68} height={68} />
        </span>
        <span className="assistant-dot" aria-hidden="true" />
      </button>
    </div>
  );
}
