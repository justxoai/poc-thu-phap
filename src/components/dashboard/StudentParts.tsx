"use client";

import Image from "next/image";
import { useActionState, useId, useRef, useState, type ReactNode } from "react";

import { deleteStudentAction, type AdminOpState } from "@/app/admin/dashboard/admin-actions";
import { PlaceStudentForm } from "@/components/dashboard/AdminForms";
import { DialogFrame } from "@/components/dashboard/AdminDialog";
import { ProfileAvatar } from "@/components/student/ProfileAvatar";
import { Icon } from "@/components/ui/Icon";
import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import { formatScore, formatVnDate, formatVnDateTime } from "@/lib/format";
import { gemLabel } from "@/lib/ledger-view";
import type { AdminContact } from "@/lib/firestore/accounts";
import type { StudentPublicProfile, WorkItem } from "@/lib/types";

const IDLE: AdminOpState = { status: "idle" };

/** Nút thùng rác + hộp xác nhận. Xóa mềm: hồ sơ được chuyển sang `studentsArchive`, không mất bài nộp/sổ cái. */
export function DeleteStudentButton({ id, name, disabled = false }: { id: string; name: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteStudentAction, IDLE);
  const trigger = useRef<HTMLButtonElement>(null);

  // Xóa xong thì đóng hộp (dòng sẽ biến mất khi trang làm mới); không dùng effect để tránh render lồng.
  const showing = open && state.status !== "ok";

  return (
    <>
      <button type="button" ref={trigger} className="ad-icon-btn is-danger" disabled={disabled} onClick={() => setOpen(true)} aria-label={`Xóa ${name || id}`} title={disabled ? "Không xóa được tài khoản quản trị" : "Xóa"}>
        <Icon name="trash" size={17} />
      </button>
      {showing ? (
        <DialogFrame title="Xóa học viên?" size="sm" onClose={() => setOpen(false)}>
          <form action={formAction} className="ad-confirm">
            <input type="hidden" name="studentId" value={id} />
            <p>
              Xóa <strong>{name || "học viên"}</strong> (<code>{id}</code>) khỏi danh sách và chặn đăng nhập? Bài nộp, ngọc và đơn hàng vẫn được giữ; hồ sơ lưu ở <code>studentsArchive</code> nên khôi phục được.
            </p>
            {state.status === "error" ? <p className="dash-error">{state.message}</p> : null}
            <div className="ad-confirm-actions">
              <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setOpen(false)}>
                Hủy
              </button>
              <button type="submit" className="ad-btn ad-btn-danger" disabled={pending}>
                {pending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </form>
        </DialogFrame>
      ) : null}
    </>
  );
}

type TabId = "info" | "works" | "assets";
const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "Thông tin" },
  { id: "works", label: "Bài tập nộp" },
  { id: "assets", label: "Tài sản" },
];

function Fact({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "ad-wide" : undefined}>
      <dt>{label}</dt>
      <dd>{children || "—"}</dd>
    </div>
  );
}

/** Nội dung popup chi tiết một học viên: 3 tab (Thông tin, Bài tập nộp, Tài sản). Dữ liệu đã được server lọc theo quyền quản trị. */
export function StudentDetail({ profile, contact, works }: { profile: StudentPublicProfile; contact: AdminContact; works: WorkItem[] }) {
  const [tab, setTab] = useState<TabId>("info");
  const uid = useId();
  const pending = contact.placement === "pending";
  const gemEntries = Object.entries(profile.wallet);

  return (
    <div>
      <div className="ad-hero">
        <ProfileAvatar name={profile.name} decor={profile.decor} size={64} />
        <div>
          <strong>{profile.name || "Học viên"}</strong>
          <code>{profile.id}</code> · {pending ? "Chờ xếp lớp" : `Khóa ${profile.course || "—"} · Tổ ${profile.group || "—"}`}
        </div>
      </div>

      <div className="ad-tabs" role="tablist" aria-label="Chi tiết học viên">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`${uid}-${t.id}`} aria-selected={tab === t.id} aria-controls={`${uid}-panel`} className="ad-tab" onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "works" ? ` (${works.length})` : ""}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-${tab}`}>
        {tab === "info" ? (
          <>
            <dl className="ad-facts">
              <Fact label="Mã học viên">
                <code>{profile.id}</code>
              </Fact>
              <Fact label="Họ và tên">{profile.name}</Fact>
              <Fact label="Khóa">{profile.course}</Fact>
              <Fact label="Tổ">{profile.group}</Fact>
              <Fact label="Số điện thoại">{contact.phone}</Fact>
              <Fact label="Email">{contact.email ? `${contact.email}${contact.emailVerified ? " (đã xác minh)" : " (chưa xác minh)"}` : ""}</Fact>
              <Fact label="Ngày sinh">{contact.birthDate}</Fact>
              <Fact label="Zalo">{contact.zaloName}</Fact>
              <Fact label="Địa chỉ" wide>
                {contact.address}
              </Fact>
              <Fact label="Đăng ký lúc">{contact.createdAt ? formatVnDateTime(contact.createdAt) : ""}</Fact>
              <Fact label="Gói trả phí">{contact.paid ? "Đã mua" : "Chưa"}</Fact>
              <Fact label="Số bài nộp">{String(profile.stats.submissionCount)}</Fact>
              <Fact label="Bài gần nhất">{profile.stats.lastSubmittedAt ? formatVnDateTime(profile.stats.lastSubmittedAt) : ""}</Fact>
            </dl>
            {pending ? (
              <div className="ad-place">
                <h3 className="dash-h2">Xếp lớp</h3>
                <p>Tài khoản mới chưa có Tổ/Khóa nên chưa nộp bài được.</p>
                <PlaceStudentForm studentId={profile.id} />
              </div>
            ) : null}
            <p className="ad-note">Thông tin cá nhân, chỉ dùng để quản lý lớp. Không chụp màn hình hoặc chia sẻ ra ngoài.</p>
          </>
        ) : null}

        {tab === "works" ? (
          works.length === 0 ? (
            <p className="dash-empty">Chưa có bài nộp nào.</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Thời gian nộp</th>
                    <th>Ảnh</th>
                    <th>Bài tập</th>
                    <th className="num">Điểm</th>
                    <th>Nhận xét</th>
                  </tr>
                </thead>
                <tbody>
                  {works.map((w, i) => {
                    const thumb = driveThumbnailUrl(w.driveFileId, 160);
                    const view = driveViewUrl(w.driveFileId);
                    return (
                      <tr key={w.id}>
                        <td>{i + 1}</td>
                        <td>{formatVnDateTime(w.submittedAt)}</td>
                        <td>
                          {thumb && view ? (
                            <a className="ad-thumb" href={view} target="_blank" rel="noopener noreferrer">
                              <Image src={thumb} alt={`Bài nộp ${formatVnDate(w.submittedAt)}`} width={56} height={70} unoptimized loading="lazy" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{w.description || "—"}</td>
                        <td className="num">{w.score === null ? "Chưa chấm" : formatScore(w.score)}</td>
                        <td>{w.comment || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {profile.stats.submissionCount > works.length ? <p className="ad-note">Hiện {works.length} bài mới nhất.</p> : null}
            </div>
          )
        ) : null}

        {tab === "assets" ? (
          <>
            <h3 className="dash-h2">Ngọc</h3>
            {gemEntries.length === 0 ? (
              <p className="dash-empty">Chưa có ngọc.</p>
            ) : (
              <ul className="ad-wallet">
                {gemEntries.map(([key, amount]) => (
                  <li key={key}>
                    <b>{amount}</b>
                    <span>{gemLabel(key)}</span>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="dash-h2">Vật phẩm</h3>
            {profile.inventory.length === 0 ? (
              <p className="dash-empty">Chưa có vật phẩm.</p>
            ) : (
              <ul className="ad-wallet">
                {profile.inventory.map((item) => (
                  <li key={item.id}>
                    <b>× {item.quantity}</b>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
