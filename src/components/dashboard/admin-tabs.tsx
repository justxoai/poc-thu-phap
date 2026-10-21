import Image from "next/image";
import Link from "next/link";

import { GradeForm, PostForm, WalletAdjustForm } from "@/components/dashboard/AdminForms";
import { Result } from "@/components/dashboard/views";
import { driveThumbnailUrl, driveViewUrl } from "@/lib/drive";
import type { AdminPostRow, AdminTransaction, PostEditData } from "@/lib/firestore/admin-content";
import { formatVnDateTime } from "@/lib/format";
import { gemLabel, sourceLabel } from "@/lib/ledger-view";
import type { DataResult, WorkItem } from "@/lib/types";

/** Ba tab mới của khu thầy: Ngọc & ví, Chấm bài, Tin tức. Là Server Component; chỉ biểu mẫu (AdminForms) chạy ở trình duyệt. */

export function ReadOnlyNotice() {
  return (
    <p className="dash-notice">
      Đang ở chế độ <b>chỉ xem</b>. Muốn ghi dữ liệu (cộng/trừ ngọc, chợ, chấm bài, tin tức), hãy đặt biến <code>adminAccessKey</code> rồi đăng nhập bằng khóa, hoặc chạy <code>next dev</code>.
    </p>
  );
}

/* ---------- Ngọc & ví ---------- */

export function WalletTab({ canWrite, ledger }: { canWrite: boolean; ledger: DataResult<{ rows: AdminTransaction[]; nextCursor: string | null }> }) {
  return (
    <>
      {canWrite ? <WalletAdjustForm /> : <ReadOnlyNotice />}
      <h2 className="dash-h2">Sổ cái gần đây</h2>
      <Result result={ledger}>
        {(page) =>
          page.rows.length === 0 ? (
            <p className="dash-empty">Chưa có giao dịch nào.</p>
          ) : (
            <>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Học viên</th>
                      <th>Nguồn</th>
                      <th>Loại ngọc</th>
                      <th className="num">Thay đổi</th>
                      <th className="num">Số dư sau</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</td>
                        <td>
                          <code>{row.studentId}</code>
                        </td>
                        <td>{sourceLabel(row.source)}</td>
                        <td>{gemLabel(row.currency)}</td>
                        <td className="num">{row.amount > 0 ? `+${row.amount}` : row.amount}</td>
                        <td className="num">{row.balanceAfter}</td>
                        <td>{row.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {page.nextCursor ? (
                <p className="dash-next">
                  <Link href={`/admin/dashboard?tab=vi&cursor=${encodeURIComponent(page.nextCursor)}`}>Trang sau →</Link>
                </p>
              ) : null}
            </>
          )
        }
      </Result>
    </>
  );
}

/* ---------- Chấm bài ---------- */

export function GradeTab({ canWrite, works }: { canWrite: boolean; works: DataResult<WorkItem[]> }) {
  return (
    <>
      {canWrite ? null : <ReadOnlyNotice />}
      <p className="dash-privacy">Hiện 100 bài mới nhất, bài chưa chấm xếp trước. Điểm 0–10; chấm lại chỉ cộng phần chênh vào thống kê học viên.</p>
      <Result result={works}>
        {(list) =>
          list.length === 0 ? (
            <p className="dash-empty">Chưa có bài nào.</p>
          ) : (
            <ul className="dash-grade-list">
              {list.map((work) => {
                const thumb = driveThumbnailUrl(work.driveFileId, 240);
                const view = driveViewUrl(work.driveFileId);
                return (
                  <li key={work.id}>
                    {thumb && view ? (
                      <a href={view} target="_blank" rel="noopener noreferrer">
                        <Image src={thumb} alt={`Bài của ${work.studentName}`} width={120} height={150} unoptimized loading="lazy" />
                      </a>
                    ) : null}
                    <div>
                      <strong>{work.studentName || "Học viên"}</strong> <small>(Tổ {work.group || "—"}, Khóa {work.course || "—"} · {work.studentId})</small>
                      <div className="dash-privacy">{formatVnDateTime(work.submittedAt)}{work.description ? ` · ${work.description}` : ""}</div>
                      {canWrite ? <GradeForm work={work} /> : <span>{work.score === null ? "Chưa chấm" : `Điểm: ${work.score}`}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        }
      </Result>
    </>
  );
}

/* ---------- Tin tức ---------- */

export function PostsTab({ canWrite, posts, editing, editingMissing, today }: { canWrite: boolean; posts: DataResult<AdminPostRow[]>; editing: PostEditData | null; editingMissing: boolean; today: string }) {
  return (
    <>
      {canWrite ? (
        <>
          {editingMissing ? <p className="dash-notice dash-notice-error">Không tìm thấy bài cần sửa.</p> : null}
          <PostForm key={editing?.id ?? "new"} post={editing} today={today} />
          {editing ? (
            <p>
              <Link href="/admin/dashboard?tab=tin-tuc">Đăng bài mới thay vì sửa →</Link>
            </p>
          ) : null}
        </>
      ) : (
        <ReadOnlyNotice />
      )}
      <h2 className="dash-h2">Bài gần đây</h2>
      <Result result={posts}>
        {(list) =>
          list.length === 0 ? (
            <p className="dash-empty">Chưa có bài nào (collection posts trống).</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Tiêu đề</th>
                    <th>Chủ đề</th>
                    <th>Trạng thái</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td>{p.publishedAt ? formatVnDateTime(p.publishedAt).slice(0, 10) : "—"}</td>
                      <td>{p.href && p.status === "published" ? <Link href={p.href}>{p.title}</Link> : p.title}</td>
                      <td>{p.labels.join(", ") || "—"}</td>
                      <td>
                        <span className={p.status === "published" ? "dash-chip dash-chip-active" : "dash-chip dash-chip-warning"}>{p.status === "published" ? "Đã đăng" : "Nháp"}</span>
                      </td>
                      <td>{canWrite ? <Link href={`/admin/dashboard?tab=tin-tuc&edit=${encodeURIComponent(p.id)}`}>Sửa</Link> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Result>
    </>
  );
}
