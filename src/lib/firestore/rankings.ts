import "server-only";

import { cachedResult } from "@/lib/cache";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import { averageOf, rankPoints, type RankRow } from "@/lib/ranking";
import type { DataResult } from "@/lib/types";

/** Bảng xếp hạng được tính sẵn, gom theo khóa: `rankings/{khóa}` = { students: [{ name, group, course, submissions, graded, scoreSum, longestStreak, wealth }], updatedAt }. */
const COLLECTION = "rankings";
/** Tối đa số khóa (document) đọc mỗi lần. */
const MAX_COURSE_DOCS = 20;
/** Giới hạn mỗi document (1 MiB): khoảng 5.000 học viên/khóa là an toàn; vượt thì tách thêm document. */
export const RANKING_TTL_MS = 60_000;

function mapRow(raw: unknown, courseId: string): RankRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = toText(r.name).trim();
  if (!name) return null;
  const submissions = Math.max(0, toNumber(r.submissions));
  const graded = Math.max(0, toNumber(r.graded));
  const scoreSum = Math.max(0, toNumber(r.scoreSum));
  return {
    name,
    group: toText(r.group),
    course: toText(r.course) || courseId,
    rank: rankPoints(submissions, scoreSum),
    submissions,
    graded,
    scoreSum,
    average: averageOf(scoreSum, graded),
    longestStreak: Math.max(0, toNumber(r.longestStreak)),
    wealth: Math.max(0, toNumber(r.wealth)),
  };
}

export function loadRankRows(): Promise<DataResult<RankRow[]>> {
  return cachedResult("rankings:all", RANKING_TTL_MS, () =>
    runQuery("rankings:load", async (db) => {
      const snap = await db.collection(COLLECTION).limit(MAX_COURSE_DOCS).get();
      const rows: RankRow[] = [];
      for (const doc of snap.docs) {
        const list = doc.data().students;
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          const row = mapRow(item, doc.id);
          if (row) rows.push(row);
        }
      }
      return rows;
    }),
  );
}
