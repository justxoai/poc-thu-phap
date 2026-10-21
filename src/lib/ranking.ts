/**
 * Bảng xếp hạng (hàm thuần, không đọc Firestore). Công thức theo trang cũ:
 *   Rank = số bài hợp lệ + tổng điểm các bài hợp lệ đã chấm
 *   Điểm TB = tổng điểm / số bài đã chấm
 *   Bền bỉ = chuỗi ngày nộp liên tục dài nhất; Năng nổ = số bài hợp lệ; Phú hào = tài sản quy ra Hoàng Ngọc
 */

/** Một dòng xếp hạng. KHÔNG chứa mã học viên (trang công khai không được lộ mã). */
export interface RankRow {
  name: string;
  group: string;
  course: string;
  rank: number;
  submissions: number;
  graded: number;
  scoreSum: number;
  average: number;
  longestStreak: number;
  /** Tài sản quy ra Hoàng Ngọc. */
  wealth: number;
}

export type RankMode = "rank" | "average" | "streak" | "active" | "wealth";

export const RANK_MODES: { id: RankMode; label: string; student: string; hint: string }[] = [
  { id: "rank", label: "Top rank tổng", student: "Top rank tổng", hint: "Rank = số bài hợp lệ + tổng điểm các bài hợp lệ đã được chấm." },
  { id: "average", label: "Top điểm trung bình", student: "Top điểm trung bình cao nhất", hint: "Chỉ tính các bài đã được giáo viên chấm điểm." },
  { id: "streak", label: "Top bền bỉ", student: "Top bền bỉ nhất", hint: "Chuỗi ngày nộp bài hợp lệ liên tục dài nhất." },
  { id: "active", label: "Top năng nổ", student: "Top năng nổ nhất", hint: "Tổng số lượt nộp bài hợp lệ." },
  { id: "wealth", label: "Top phú hào", student: "Top phú hào", hint: "Tài sản ngọc quy ra Hoàng Ngọc." },
];

export function parseRankMode(value: string | null | undefined): RankMode {
  return RANK_MODES.find((m) => m.id === value)?.id ?? "rank";
}

export function rankPoints(submissions: number, scoreSum: number): number {
  return submissions + scoreSum;
}

export function averageOf(scoreSum: number, graded: number): number {
  return graded > 0 ? scoreSum / graded : 0;
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" });

/** Giá trị dùng để xếp theo từng tiêu chí, kèm hạng phụ theo Rank rồi theo tên. */
function metric(row: RankRow, mode: RankMode): number {
  switch (mode) {
    case "average":
      return row.average;
    case "streak":
      return row.longestStreak;
    case "active":
      return row.submissions;
    case "wealth":
      return row.wealth;
    default:
      return row.rank;
  }
}

export function sortRows(rows: RankRow[], mode: RankMode): RankRow[] {
  return [...rows].sort((a, b) => metric(b, mode) - metric(a, mode) || b.rank - a.rank || byName(a, b));
}

export interface RankFilter {
  course: string | null;
  group: string | null;
}

export function filterRows(rows: RankRow[], filter: RankFilter): RankRow[] {
  return rows.filter((r) => (!filter.course || r.course === filter.course) && (!filter.group || r.group === filter.group));
}

export interface TeamRow {
  group: string;
  course: string;
  members: number;
  rank: number;
  submissions: number;
  graded: number;
  scoreSum: number;
  average: number;
  streakSum: number;
  averageStreak: number;
  bestStreak: number;
  wealth: number;
}

/** Gộp theo (khóa, tổ). Dòng thiếu tổ hoặc khóa bị bỏ qua (giống trang cũ). */
export function buildTeams(rows: RankRow[], course: string | null): TeamRow[] {
  const map = new Map<string, TeamRow>();
  for (const r of rows) {
    if (!r.group || !r.course || (course && r.course !== course)) continue;
    const key = `${r.course}||${r.group}`;
    let t = map.get(key);
    if (!t) {
      t = { group: r.group, course: r.course, members: 0, rank: 0, submissions: 0, graded: 0, scoreSum: 0, average: 0, streakSum: 0, averageStreak: 0, bestStreak: 0, wealth: 0 };
      map.set(key, t);
    }
    t.members += 1;
    t.rank += r.rank;
    t.submissions += r.submissions;
    t.graded += r.graded;
    t.scoreSum += r.scoreSum;
    t.streakSum += r.longestStreak;
    t.bestStreak = Math.max(t.bestStreak, r.longestStreak);
    t.wealth += r.wealth;
  }
  for (const t of map.values()) {
    t.average = averageOf(t.scoreSum, t.graded);
    t.averageStreak = t.members > 0 ? t.streakSum / t.members : 0;
  }
  return [...map.values()];
}

function teamMetric(t: TeamRow, mode: RankMode): number {
  switch (mode) {
    case "average":
      return t.average;
    case "streak":
      return t.averageStreak;
    case "active":
      return t.submissions;
    case "wealth":
      return t.wealth;
    default:
      return t.rank;
  }
}

export function sortTeams(teams: TeamRow[], mode: RankMode): TeamRow[] {
  return [...teams].sort(
    (a, b) => teamMetric(b, mode) - teamMetric(a, mode) || b.rank - a.rank || a.course.localeCompare(b.course, "vi", { numeric: true }) || a.group.localeCompare(b.group, "vi", { numeric: true }),
  );
}

export interface RankingTotals {
  students: number;
  teams: number;
  submissions: number;
  rank: number;
}

export function totalsOf(rows: RankRow[]): RankingTotals {
  const teams = new Set<string>();
  let submissions = 0;
  let rank = 0;
  for (const r of rows) {
    if (r.group && r.course) teams.add(`${r.course}||${r.group}`);
    submissions += r.submissions;
    rank += r.rank;
  }
  return { students: rows.length, teams: teams.size, submissions, rank };
}

export const PAGE_SIZE = 50;

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): { items: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}
