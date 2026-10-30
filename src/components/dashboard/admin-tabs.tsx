import Link from "next/link";

import { PostForm, WalletAdjustForm } from "@/components/dashboard/AdminForms";
import { PageSizeSelect } from "@/components/dashboard/ListControls";
import { Pager } from "@/components/dashboard/Pager";
import { Icon } from "@/components/ui/Icon";
import { adminHref, type PageInfo } from "@/lib/admin-paging";
import { Result } from "@/components/dashboard/views";
import type { AdminPostRow, AdminTransaction, PostEditData, PostListParams } from "@/lib/firestore/admin-content";
import { formatVnDateTime } from "@/lib/format";
import { gemLabel, sourceLabel } from "@/lib/ledger-view";
import type { DataResult } from "@/lib/types";

/** Các tab của khu thầy: Ngọc & ví, Tin tức. Là Server Component; chỉ biểu mẫu (AdminForms) chạy ở trình duyệt. */

export function ReadOnlyNotice() {
  return (
    <p className="dash-notice">
      Tài khoản này <b>không có quyền ghi</b> (chỉ tài khoản role admin mới cộng/trừ ngọc, chấm bài, đăng tin...).</p>
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

/* ---------- Tin tức ---------- */

const POSTS_TAB = "tin-tuc";

/**
 * Tin tức: mặc định là DANH SÁCH (lọc trạng thái, 10/20/50/100 dòng/trang) với nút "Tạo tin tức mới".
 * Bấm nút (?new=1) hoặc "Sửa" (?edit=ID) thì cả màn hình là biểu mẫu soạn bài; lưu xong quay về danh sách.
 */
export function PostsView({ list, params, form, saved }: { list: DataResult<{ rows: AdminPostRow[]; info: PageInfo }> | null; params: PostListParams; form: { editing: PostEditData | null; editingMissing: boolean; today: string } | null; saved: "new" | "edit" | null }) {
  const keep = { status: params.status, size: params.size };
  const listHref = adminHref(POSTS_TAB, keep);
  if (form) {
    return (
      <>
        <p>
          <Link href={listHref}>← Về danh sách tin tức</Link>
        </p>
        {form.editingMissing ? <p className="dash-notice dash-notice-error">Không tìm thấy bài cần sửa.</p> : null}
        <PostForm key={form.editing?.id ?? "new"} post={form.editing} today={form.today} listHref={listHref} />
      </>
    );
  }
  return (
    <>
      {saved ? <p className="dash-ok" role="status">{saved === "new" ? "Đã tạo tin tức mới." : "Đã lưu thay đổi."}</p> : null}
      <div className="ad-market-bar">
        <form method="get" action="/admin/dashboard" className="ad-bar">
          <input type="hidden" name="tab" value={POSTS_TAB} />
          <label>
            Trạng thái
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">Tất cả</option>
              <option value="published">Đã đăng</option>
              <option value="draft">Nháp</option>
            </select>
          </label>
          <PageSizeSelect value={params.size} />
          <button type="submit" className="ad-btn">
            Lọc
          </button>
          {params.status ? (
            <Link className="ad-clear" href={adminHref(POSTS_TAB, { size: params.size })}>
              Bỏ lọc
            </Link>
          ) : null}
        </form>
        <Link className="ad-btn" href={adminHref(POSTS_TAB, { ...keep, new: 1 })}>
          <Icon name="plus" size={16} /> Tạo tin tức mới
        </Link>
      </div>
      {list ? (
        <Result result={list}>
          {({ rows, info }) =>
            rows.length === 0 ? (
              <p className="dash-empty">{params.status ? "Không có bài nào ở trạng thái này." : "Chưa có bài nào (collection posts trống)."}</p>
            ) : (
              <>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Tiêu đề</th>
                        <th>Chủ đề</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p) => (
                        <tr key={p.id}>
                          <td>{p.publishedAt ? formatVnDateTime(p.publishedAt).slice(0, 10) : "—"}</td>
                          <td>{p.href && p.status === "published" ? <Link href={p.href}>{p.title}</Link> : p.title}</td>
                          <td>{p.labels.join(", ") || "—"}</td>
                          <td>
                            <span className={p.status === "published" ? "dash-chip dash-chip-active" : "dash-chip dash-chip-warning"}>{p.status === "published" ? "Đã đăng" : "Nháp"}</span>
                          </td>
                          <td>
                            <Link className="ad-icon-btn" href={adminHref(POSTS_TAB, { ...keep, edit: p.id })} aria-label={`Sửa ${p.title}`} title="Sửa">
                              <Icon name="pen" size={17} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pager tab={POSTS_TAB} params={{ status: params.status }} info={info} />
              </>
            )
          }
        </Result>
      ) : null}
    </>
  );
}
