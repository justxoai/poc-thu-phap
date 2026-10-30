import Link from "next/link";

import { AdminDialog } from "@/components/dashboard/AdminDialog";
import { PageSizeSelect } from "@/components/dashboard/ListControls";
import { Pager } from "@/components/dashboard/Pager";
import { DeleteStudentButton, StudentDetail } from "@/components/dashboard/StudentParts";
import { Result } from "@/components/dashboard/views";
import { Icon } from "@/components/ui/Icon";
import { adminHref, type PageInfo } from "@/lib/admin-paging";
import type { PendingStudent } from "@/lib/firestore/accounts";
import type { ClassRow } from "@/lib/firestore/admin-data";
import type { StudentAdminDetail, StudentListParams, StudentListRow } from "@/lib/firestore/admin-students";
import { formatScore, formatVnDateTime } from "@/lib/format";
import type { DataResult } from "@/lib/types";

/** Các danh sách học viên của khu quản trị (Học viên mới, Học viên, Lớp). Server Component; chỉ nút/popup (client) tương tác. */

type Keep = Record<string, string | number | null | undefined>;

/** Popup chi tiết: mở bằng `?view=<mã>`; đóng thì quay về đúng bộ lọc và trang đang xem. */
function DetailDialog({ tab, keep, detail }: { tab: string; keep: Keep; detail: DataResult<StudentAdminDetail | null> }) {
  const closeHref = adminHref(tab, keep);
  return (
    <AdminDialog title="Chi tiết học viên" closeHref={closeHref} size="lg">
      <Result result={detail}>
        {(d) => (d ? <StudentDetail key={d.profile.id} profile={d.profile} contact={d.contact} works={d.works} /> : <p className="dash-empty">Không tìm thấy học viên (có thể đã bị xóa).</p>)}
      </Result>
    </AdminDialog>
  );
}

function RowActions({ tab, keep, id, name, isAdmin = false }: { tab: string; keep: Keep; id: string; name: string; isAdmin?: boolean }) {
  return (
    <div className="ad-actions">
      <Link className="ad-icon-btn" href={adminHref(tab, { ...keep, view: id })} scroll={false} aria-label={`Xem chi tiết ${name || id}`} title="Xem chi tiết">
        <Icon name="pen" size={17} />
      </Link>
      <DeleteStudentButton id={id} name={name} disabled={isAdmin} />
    </div>
  );
}

/* ---------- Học viên mới ---------- */

export function NewStudentsView({ result, keep, size, detail }: { result: DataResult<{ rows: PendingStudent[]; info: PageInfo }>; keep: Keep; size: number; detail: DataResult<StudentAdminDetail | null> | null }) {
  const tab = "hoc-vien-moi";
  return (
    <>
      <form method="get" action="/admin/dashboard" className="ad-bar">
        <input type="hidden" name="tab" value={tab} />
        <PageSizeSelect value={size} />
      </form>
      <Result result={result}>
        {({ rows, info }) => (
          <>
            {rows.length === 0 ? (
              <p className="dash-empty">Không có học viên nào đang chờ xếp lớp.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Họ và tên</th>
                      <th>Thời gian đăng ký</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <code>{row.id}</code>
                        </td>
                        <td>{row.name || "—"}</td>
                        <td>{row.createdAt ? formatVnDateTime(row.createdAt) : "—"}</td>
                        <td>
                          <RowActions tab={tab} keep={keep} id={row.id} name={row.name} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager tab={tab} params={{}} info={info} />
          </>
        )}
      </Result>
      {detail ? <DetailDialog tab={tab} keep={keep} detail={detail} /> : null}
    </>
  );
}

/* ---------- Học viên ---------- */

export function StudentsListView({ result, params, keep, detail }: { result: DataResult<{ rows: StudentListRow[]; info: PageInfo }>; params: StudentListParams; keep: Keep; detail: DataResult<StudentAdminDetail | null> | null }) {
  const tab = "hoc-vien";
  const filtered = Boolean(params.q || params.course || params.group);
  const filters = { q: params.q, course: params.course, group: params.group };
  return (
    <>
      <form method="get" action="/admin/dashboard" className="ad-bar">
        <input type="hidden" name="tab" value={tab} />
        <label className="ad-grow">
          Tìm theo mã hoặc họ tên
          <input type="search" name="q" defaultValue={params.q ?? ""} maxLength={60} placeholder="TT00012 hoặc Nguyễn Văn..." />
        </label>
        <label>
          Khóa
          <input className="ad-narrow" name="course" defaultValue={params.course ?? ""} maxLength={10} inputMode="numeric" />
        </label>
        <label>
          Tổ
          <input className="ad-narrow" name="group" defaultValue={params.group ?? ""} maxLength={10} inputMode="numeric" />
        </label>
        <PageSizeSelect value={params.size} />
        <button type="submit" className="ad-btn">
          Lọc
        </button>
        {filtered ? (
          <Link className="ad-clear" href={adminHref(tab, { size: params.size })}>
            Bỏ lọc
          </Link>
        ) : null}
      </form>
      <Result result={result}>
        {({ rows, info }) => (
          <>
            {rows.length === 0 ? (
              <p className="dash-empty">{filtered ? "Không có học viên phù hợp với bộ lọc." : "Chưa có học viên nào."}</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Họ và tên</th>
                      <th>Khóa</th>
                      <th>Tổ</th>
                      <th className="num">Số bài nộp</th>
                      <th className="num">Điểm TB</th>
                      <th>Bài gần nhất</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <code>{row.id}</code>
                        </td>
                        <td>
                          <Link className="ad-name-link" href={adminHref(tab, { ...keep, view: row.id })} scroll={false}>
                            {row.name || "—"}
                          </Link>
                          {row.isAdmin ? <span className="dash-chip"> Quản trị</span> : null}
                        </td>
                        <td>{row.course || "—"}</td>
                        <td>{row.group || "—"}</td>
                        <td className="num">{row.submissionCount}</td>
                        <td className="num">{row.average ? formatScore(row.average) : "—"}</td>
                        <td>{row.lastSubmittedAt ? formatVnDateTime(row.lastSubmittedAt) : "—"}</td>
                        <td>
                          <RowActions tab={tab} keep={keep} id={row.id} name={row.name} isAdmin={row.isAdmin} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager tab={tab} params={filters} info={info} />
          </>
        )}
      </Result>
      {detail ? <DetailDialog tab={tab} keep={keep} detail={detail} /> : null}
    </>
  );
}

/* ---------- Lớp ---------- */

export function ClassesListView({ result, course, size }: { result: DataResult<{ rows: ClassRow[]; info: PageInfo }>; course: string | null; size: number }) {
  const tab = "lop";
  return (
    <>
      <form method="get" action="/admin/dashboard" className="ad-bar">
        <input type="hidden" name="tab" value={tab} />
        <label>
          Khóa
          <input className="ad-narrow" name="course" defaultValue={course ?? ""} maxLength={10} inputMode="numeric" />
        </label>
        <PageSizeSelect value={size} />
        <button type="submit" className="ad-btn">
          Lọc
        </button>
        {course ? (
          <Link className="ad-clear" href={adminHref(tab, { size })}>
            Bỏ lọc
          </Link>
        ) : null}
      </form>
      <Result result={result}>
        {({ rows, info }) => (
          <>
            {rows.length === 0 ? (
              <p className="dash-empty">{course ? "Không có lớp nào ở khóa này." : "Chưa có lớp nào (collection classCodes trống)."}</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Khóa</th>
                      <th>Tổ</th>
                      <th>Mã tra cứu (cán sự)</th>
                      <th className="num">Số học viên</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.code}>
                        <td>Khóa {row.course}</td>
                        <td>Tổ {row.group}</td>
                        <td>
                          <code>{row.code}</code>
                        </td>
                        <td className="num">{row.members}</td>
                        <td>
                          <div className="ad-actions">
                            <Link className="ad-icon-btn" href={adminHref("hoc-vien", { course: row.course, group: row.group })} aria-label={`Xem học viên Khóa ${row.course} Tổ ${row.group}`} title="Xem học viên của lớp">
                              <Icon name="eye" size={17} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager tab={tab} params={{ course }} info={info} memory />
          </>
        )}
      </Result>
    </>
  );
}
