import type { Metadata } from "next";
import Link from "next/link";

import { levelFor } from "@/data/gems";
import { loadRankRows } from "@/lib/firestore/rankings";
import {
  buildTeams,
  filterRows,
  paginate,
  parseRankMode,
  RANK_MODES,
  sortRows,
  sortTeams,
  totalsOf,
  type RankMode,
  type RankRow,
} from "@/lib/ranking";

import "./ranking.css";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Bảng xếp hạng học viên",
  description: "Thành tích học tập, độ bền bỉ, mức độ năng nổ và tài sản ngọc của học viên và các tổ.",
};

// Số liệu đọc từ bảng xếp hạng tính sẵn (rankings/*), có bộ nhớ đệm 60 giây; trang phụ thuộc tham số nên dựng theo yêu cầu.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const LABEL = /^[0-9A-Za-z_-]{1,10}$/;

function one(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : null;
}

function label(value: string | string[] | undefined): string | null {
  const v = one(value);
  return v && LABEL.test(v) ? v : null;
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
}

/** Hạng 1-3 hiện icon huy chương kèm số; các hạng còn lại chỉ hiện số. */
function Place({ n }: { n: number }) {
  return n <= 3 ? (
    <span className="rk-place">
      <Icon name="award" /> {n}
    </span>
  ) : (
    <>{n}</>
  );
}
const n0 = (value: number) => new Intl.NumberFormat("vi-VN").format(Math.round(value));
const n2 = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value);

function metricText(row: RankRow, mode: RankMode): string {
  switch (mode) {
    case "average":
      return `${n2(row.average)} điểm TB`;
    case "streak":
      return `${n0(row.longestStreak)} ngày`;
    case "active":
      return `${n0(row.submissions)} bài`;
    case "wealth":
      return `${n0(row.wealth)} Hoàng Ngọc`;
    default:
      return `${n0(row.rank)} Rank`;
  }
}

function href(params: Record<string, string | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `/bang-xep-hang?${s}` : "/bang-xep-hang";
}

export default async function RankingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const studentMode = parseRankMode(one(sp.m));
  const teamMode = parseRankMode(one(sp.tm));
  const group = label(sp.to);
  const course = label(sp.khoa);
  const teamCourse = label(sp.tk);
  const pageNo = Number(one(sp.trang)) || 1;

  const result = await loadRankRows();
  const rows = result.status === "ok" ? result.data : [];
  const totals = totalsOf(rows);
  const courses = sortedUnique(rows.map((r) => r.course));
  const groups = sortedUnique(rows.map((r) => r.group));

  const teams = sortTeams(buildTeams(rows, teamCourse), teamMode);
  const students = sortRows(filterRows(rows, { course, group }), studentMode);
  const page = paginate(students, pageNo);
  const offset = (page.page - 1) * 50;
  const podium = page.page === 1 ? page.items.slice(0, 3) : [];
  const modeInfo = RANK_MODES.find((m) => m.id === studentMode)!;
  const teamInfo = RANK_MODES.find((m) => m.id === teamMode)!;

  const keep = (names: string[]) =>
    names.map((name) => {
      const value = { m: studentMode === "rank" ? null : studentMode, to: group, khoa: course, tm: teamMode === "rank" ? null : teamMode, tk: teamCourse }[name];
      return value ? <input key={name} type="hidden" name={name} value={value} /> : null;
    });

  return (
    <div className="container page rk">
      <header className="rk-head">
        <p className="rk-kicker">Bảng xếp hạng</p>
        <h1>Bảng xếp hạng học viên</h1>
        <p>Theo dõi thành tích học tập, độ bền bỉ, mức độ năng nổ và tài sản ngọc của học viên.</p>
      </header>

      {result.status === "unconfigured" ? <p className="rk-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
      {result.status === "error" ? <p className="rk-notice rk-notice-error">Chưa đọc được bảng xếp hạng. Vui lòng thử lại sau.</p> : null}
      {result.status === "ok" && rows.length === 0 ? <p className="rk-notice">Bảng xếp hạng chưa có dữ liệu.</p> : null}

      <section className="rk-goal" aria-labelledby="rk-goal-title">
        <h2 id="rk-goal-title">Mục tiêu tốt nghiệp khóa cơ bản</h2>
        <p>Hãy duy trì chất lượng bài tập và tiến độ học tập để hướng tới các điều kiện xét tốt nghiệp khóa cơ bản.</p>
        <ul>
          <li>
            <b>Trên 7.0</b>
            <span>Điểm trung bình, chỉ tính các bài đã được giáo viên chấm điểm.</span>
          </li>
          <li>
            <b>Ít nhất 100</b>
            <span>Bài tập đã nộp, tính theo tổng số lượt bài tập hợp lệ.</span>
          </li>
          <li>
            <b>Chưa tính %</b>
            <span>Hệ thống hiện chưa áp dụng tỷ lệ xét đầu ra.</span>
          </li>
        </ul>
      </section>

      <dl className="rk-stats">
        <div>
          <dt>Học viên</dt>
          <dd>{n0(totals.students)}</dd>
        </div>
        <div>
          <dt>Tổ</dt>
          <dd>{n0(totals.teams)}</dd>
        </div>
        <div>
          <dt>Lượt nộp</dt>
          <dd>{n0(totals.submissions)}</dd>
        </div>
        <div>
          <dt>Tổng Rank</dt>
          <dd>{n0(totals.rank)}</dd>
        </div>
      </dl>

      <section className="rk-block" aria-labelledby="rk-teams-title">
        <h2 id="rk-teams-title">Xếp hạng theo tổ</h2>
        <p className="rk-sub">So sánh thành tích chung giữa các tổ theo nhiều tiêu chí.</p>
        <form method="get" action="/bang-xep-hang" className="rk-filter">
          {keep(["m", "to", "khoa"])}
          <label>
            Tiêu chí xếp hạng
            <select name="tm" defaultValue={teamMode}>
              {RANK_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Khóa học
            <select name="tk" defaultValue={teamCourse ?? ""}>
              <option value="">Tất cả khóa</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Áp dụng</button>
          <Link href={href({ m: studentMode === "rank" ? null : studentMode, to: group, khoa: course })}>Xóa lọc</Link>
        </form>
        <p className="rk-hint">
          Đang xếp tổ theo {teamInfo.label.toLowerCase()}. {teamMode === "rank" ? "Rank tổ = tổng Rank của các thành viên." : teamInfo.hint}
        </p>
        {teams.length === 0 ? (
          <p className="rk-empty">Chưa có tổ nào.</p>
        ) : (
          <div className="rk-table-wrap">
            <table className="rk-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Tổ</th>
                  <th>Khóa</th>
                  <th className="num">Thành viên</th>
                  <th className="num">Rank tổng</th>
                  <th className="num">Bài nộp</th>
                  <th className="num">Điểm TB</th>
                  <th className="num">Tài sản (Hoàng Ngọc)</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={`${t.course}-${t.group}`}>
                    <td>
                      <Place n={i + 1} />
                    </td>
                    <td>Tổ {t.group}</td>
                    <td>Khóa {t.course}</td>
                    <td className="num">{t.members}</td>
                    <td className="num">{n0(t.rank)}</td>
                    <td className="num">{n0(t.submissions)}</td>
                    <td className="num">{t.graded > 0 ? n2(t.average) : "—"}</td>
                    <td className="num">{n0(t.wealth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rk-block" aria-labelledby="rk-students-title">
        <h2 id="rk-students-title">Xếp hạng học viên</h2>
        <p className="rk-sub">Xếp hạng riêng theo Rank tổng, điểm trung bình, bền bỉ, năng nổ hoặc tài sản.</p>
        <form method="get" action="/bang-xep-hang" className="rk-filter">
          {keep(["tm", "tk"])}
          <label>
            Tiêu chí xếp hạng
            <select name="m" defaultValue={studentMode}>
              {RANK_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.student}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tổ
            <select name="to" defaultValue={group ?? ""}>
              <option value="">Tất cả tổ</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            Khóa học
            <select name="khoa" defaultValue={course ?? ""}>
              <option value="">Tất cả khóa</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Áp dụng</button>
          <Link href={href({ tm: teamMode === "rank" ? null : teamMode, tk: teamCourse })}>Xóa lọc</Link>
        </form>
        <p className="rk-hint">
          Đang xếp theo {modeInfo.student.toLowerCase()}. {n0(students.length)} học viên. {modeInfo.hint}
        </p>

        {podium.length > 0 ? (
          <ol className="rk-podium">
            {podium.map((r, i) => (
              <li key={`${r.name}-${i}`} className={`rk-podium-${i + 1}`}>
                <span className="rk-medal" aria-hidden="true">
                  <Icon name="award" size={28} />
                </span>
                <strong>{r.name}</strong>
                <span className="rk-meta">
                  Tổ {r.group || "—"} · Khóa {r.course || "—"}
                </span>
                <span className="rk-metric">{metricText(r, studentMode)}</span>
                <span className="rk-level">{levelFor(r.rank)}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {page.items.length === 0 ? (
          <p className="rk-empty">Không có học viên nào khớp bộ lọc.</p>
        ) : (
          <div className="rk-table-wrap">
            <table className="rk-table">
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Học viên</th>
                  <th>Tổ</th>
                  <th>Khóa</th>
                  <th className="num">{modeInfo.label}</th>
                  <th className="num">Rank</th>
                  <th>Cấp bậc</th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((r, i) => (
                  <tr key={`${r.name}-${offset + i}`}>
                    <td>
                      <Place n={offset + i + 1} />
                    </td>
                    <td>{r.name}</td>
                    <td>{r.group || "—"}</td>
                    <td>{r.course || "—"}</td>
                    <td className="num">{metricText(r, studentMode)}</td>
                    <td className="num">{n0(r.rank)}</td>
                    <td>{levelFor(r.rank)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page.pages > 1 ? (
          <nav className="rk-pages" aria-label="Phân trang">
            {page.page > 1 ? (
              <Link href={href({ m: studentMode === "rank" ? null : studentMode, to: group, khoa: course, tm: teamMode === "rank" ? null : teamMode, tk: teamCourse, trang: String(page.page - 1) })}>← Trang trước</Link>
            ) : null}
            <span>
              Trang {page.page} / {page.pages}
            </span>
            {page.page < page.pages ? (
              <Link href={href({ m: studentMode === "rank" ? null : studentMode, to: group, khoa: course, tm: teamMode === "rank" ? null : teamMode, tk: teamCourse, trang: String(page.page + 1) })}>Trang sau →</Link>
            ) : null}
          </nav>
        ) : null}
      </section>

      <p className="rk-foot">Số liệu được tính sẵn và cập nhật định kỳ, không phải theo thời gian thực.</p>
    </div>
  );
}
