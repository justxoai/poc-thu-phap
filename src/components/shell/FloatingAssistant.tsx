"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { checkCodeAction, loginAction, logoutAction, type CodeCheckState, type MemberCard } from "@/app/minh-hong/actions";

import "./assistant.css";

/**
 * Trợ lý nổi "Minh Hồng": 4 lối vào (có mã học viên / đăng nhập / tạo tài khoản / người mới).
 * Trạng thái đăng nhập lấy từ /api/session khi mở khung (layout không đọc cookie để trang vẫn tĩnh).
 *
 * POC-REWIND (2): ô đăng nhập hiện chỉ có "Mã học viên" (chưa có mật khẩu). Làm thật: thêm ô mật khẩu + liên kết "Đổi mật khẩu",
 * và đưa `role` từ /api/session để chỉ hiện nút "Quản trị" cho admin (POC-REWIND (3)).
 */

type View = "menu" | "code" | "login" | "newbie";
type Me = { status: "loading" } | { status: "guest" } | { status: "in"; card: MemberCard };

const IDLE: CodeCheckState = { status: "idle" };

const NEWBIE_LINKS: { href: string; label: string }[] = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/huong-dan", label: "Hướng dẫn" },
  { href: "/dang-ky-hoc", label: "Đăng ký học" },
  { href: "/sach-thu-phap", label: "Mua sách" },
  { href: "/trien-lam", label: "Phòng triển lãm" },
  { href: "/hoi-dap", label: "Hỏi đáp nhanh" },
];

const MEMBER_LINKS: { href: string; label: string }[] = [
  { href: "/nhiem-vu", label: "Nhiệm vụ" },
  { href: "/giang-duong", label: "Giảng đường" },
  { href: "/xem-lai-video", label: "Xem lại video" },
  { href: "/mau-lam-mo", label: "Mẫu lâm mô" },
  { href: "/cho-phien", label: "Chợ phiên" },
  { href: "/bang-xep-hang", label: "Bảng xếp hạng" },
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

function CodeForm({ action, state, pending, submit, note }: { action: (formData: FormData) => void; state: CodeCheckState; pending: boolean; submit: string; note: string }) {
  return (
    <form action={action} className="assistant-form">
      <label>
        <span>Mã học viên</span>
        <input name="code" type="text" maxLength={40} autoComplete="off" autoCapitalize="characters" spellCheck={false} required />
      </label>
      {state.status === "error" ? (
        <p className="assistant-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "Đang kiểm tra..." : submit}
      </button>
      <p className="assistant-note">{note}</p>
    </form>
  );
}

export function FloatingAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [me, setMe] = useState<Me>({ status: "loading" });
  const [asked, setAsked] = useState(false);

  const [codeState, codeAction, codePending] = useActionState(checkCodeAction, IDLE);
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, IDLE);

  // Hỏi trạng thái đăng nhập một lần, lần đầu mở khung.
  useEffect(() => {
    if (!open || asked) return;
    setAsked(true);
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { loggedIn: boolean; card?: MemberCard }) => setMe(data.loggedIn && data.card ? { status: "in", card: data.card } : { status: "guest" }))
      .catch(() => setMe({ status: "guest" }));
  }, [open, asked]);

  // Đăng nhập xong: cập nhật khung và làm mới trang hiện tại để mở khóa nội dung.
  useEffect(() => {
    if (loginState.status === "ok") {
      setMe({ status: "in", card: loginState.card });
      setView("menu");
      router.refresh();
    }
  }, [loginState, router]);

  async function logout() {
    await logoutAction();
    setMe({ status: "guest" });
    setView("menu");
    router.refresh();
  }

  const close = () => setOpen(false);
  const back = (
    <button type="button" className="assistant-back" onClick={() => setView("menu")}>
      ← Quay lại
    </button>
  );

  return (
    <div className="assistant">
      {open ? (
        <div className="assistant-panel" role="dialog" aria-label="Trợ lý Minh Hồng">
          <p className="assistant-title">Minh Hồng</p>

          {view === "menu" ? (
            me.status === "in" ? (
              <>
                <p>Chào {me.card.name}! Mình giúp gì cho bạn?</p>
                <Card card={me.card} />
                <div className="assistant-links">
                  {MEMBER_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} onClick={close}>
                      {l.label}
                    </Link>
                  ))}
                </div>
                <button type="button" className="assistant-secondary" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <p>Xin chào! Bạn là ai nhỉ?</p>
                <div className="assistant-menu">
                  <button type="button" onClick={() => setView("code")}>
                    Tôi có mã học viên
                  </button>
                  <button type="button" onClick={() => setView("login")}>
                    Đăng nhập tài khoản
                  </button>
                  <Link href="/dang-ky-hoc" onClick={close}>
                    Tạo tài khoản mới
                  </Link>
                  <button type="button" onClick={() => setView("newbie")}>
                    Tôi là người mới
                  </button>
                </div>
              </>
            )
          ) : null}

          {view === "code" ? (
            <>
              {back}
              <p>Minh Hồng sẽ kiểm tra mã và cho bạn xem thông tin nhanh.</p>
              {codeState.status === "ok" ? <Card card={codeState.card} /> : null}
              <CodeForm action={codeAction} state={codeState} pending={codePending} submit="Kiểm tra mã" note="Chỉ để xem nhanh. Muốn vào khu học viên (nhiệm vụ, giảng đường, video...), hãy chọn “Đăng nhập tài khoản”." />
            </>
          ) : null}

          {view === "login" ? (
            <>
              {back}
              <p>Đăng nhập để mở khóa nhiệm vụ, giảng đường và video xem lại.</p>
              {/* POC-REWIND (2): thêm ô mật khẩu ở đây. */}
              <CodeForm action={loginFormAction} state={loginState} pending={loginPending} submit="Đăng nhập" note="Bản thử nghiệm: hiện chỉ cần mã học viên, chưa cần mật khẩu." />
            </>
          ) : null}

          {view === "newbie" ? (
            <>
              {back}
              <p>
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

          {/* POC-REWIND (3): hai nút vào dashboard hiện cho mọi người. Làm thật: nút thầy chỉ hiện khi role = admin (→ /admin/dashboard),
              nút học viên chỉ hiện khi đã đăng nhập (→ /student/dashboard). */}
          <div className="assistant-dash" aria-label="Lối tắt vào dashboard">
            <Link href="/admin/dashboard" onClick={close}>
              Dashboard của thầy
            </Link>
            <Link href="/student/dashboard" onClick={close}>
              Dashboard học viên
            </Link>
          </div>
        </div>
      ) : null}

      <button type="button" className="assistant-launcher" aria-expanded={open} aria-label="Mở trợ lý Minh Hồng" onClick={() => setOpen((value) => !value)}>
        <span className="assistant-avatar">
          <Image src="/images/minh-hong.png" alt="" width={68} height={68} />
        </span>
        <span className="assistant-dot" aria-hidden="true" />
      </button>
    </div>
  );
}
