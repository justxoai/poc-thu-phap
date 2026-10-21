import "server-only";

import { cachedResult } from "@/lib/cache";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";

/** Nhiệm vụ `quests/{id}`: order, title, description, level, rewardAmount, rewardGem, active. Tiến độ từng học viên (questProgress) sẽ làm cùng hệ thống đăng nhập. */
export interface QuestItem {
  id: string;
  order: number;
  title: string;
  description: string;
  level: number;
  rewardAmount: number;
  rewardGem: string;
}

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapQuest(doc: Doc): QuestItem | null {
  const d = doc.data();
  if (!d || d.active === false) return null;
  const title = toText(d.title).trim();
  if (!title) return null;
  return {
    id: doc.id,
    order: toNumber(d.order, 9999),
    title,
    description: toText(d.description).trim().slice(0, 400),
    level: Math.max(0, Math.floor(toNumber(d.level))),
    rewardAmount: Math.max(0, toNumber(d.rewardAmount)),
    rewardGem: toText(d.rewardGem).trim().slice(0, 40),
  };
}

export const QUEST_LIMIT = 60;

export function listQuests(): Promise<DataResult<QuestItem[]>> {
  return cachedResult("quests:all", 300_000, () =>
    runQuery("quests:list", async (db) => {
      const snap = await db.collection("quests").orderBy("order").limit(QUEST_LIMIT).get();
      return snap.docs.map((d) => mapQuest(d as Doc)).filter((q): q is QuestItem => q !== null);
    }),
  );
}

/** Kết quả sự kiện hằng ngày `events/beast`: dateLabel, teams[{ team, finished, correct, score }], rulesHref (đường dẫn nội bộ). Chỉ đọc. */
export interface BeastTeam {
  team: string;
  finished: number;
  correct: number;
  score: number;
}

export interface BeastResult {
  dateLabel: string;
  teams: BeastTeam[];
  rulesHref: string;
}

export function mapBeast(data: Record<string, unknown> | undefined): BeastResult | null {
  if (!data || !Array.isArray(data.teams)) return null;
  const teams: BeastTeam[] = [];
  for (const raw of data.teams.slice(0, 3)) {
    if (!raw || typeof raw !== "object") continue;
    const t = raw as Record<string, unknown>;
    const team = toText(t.team).trim();
    if (!team) continue;
    teams.push({ team, finished: Math.max(0, toNumber(t.finished)), correct: Math.max(0, toNumber(t.correct)), score: Math.max(0, toNumber(t.score)) });
  }
  if (teams.length === 0) return null;
  const href = toText(data.rulesHref);
  return { dateLabel: toText(data.dateLabel).trim().slice(0, 40), teams, rulesHref: /^\/[A-Za-z0-9/_-]*$/.test(href) ? href : "" };
}

export function getBeastResult(): Promise<DataResult<BeastResult | null>> {
  return cachedResult("events:beast", 60_000, () =>
    runQuery("events:beast", async (db) => mapBeast((await db.collection("events").doc("beast").get()).data())),
  );
}
