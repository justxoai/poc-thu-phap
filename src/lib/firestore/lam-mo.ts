import "server-only";

import { cachedResult } from "@/lib/cache";
import { isDriveFileId } from "@/lib/drive";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";
import { normalizeText } from "@/lib/text";
import { youtubeId } from "@/lib/youtube";

/**
 * Thư viện lâm mô `lamMo/{id}`: { content (chữ), author (người viết), contentAuthor, charCount, topic, shortDesc,
 * imageId (mã tệp Drive), videoUrl, unlockPoint (điểm kinh nghiệm cần để mở), week, createdAt }.
 * Bài chưa mở: KHÔNG gửi ảnh, video, mô tả ra trình duyệt.
 */
export interface LamMoItem {
  id: string;
  content: string;
  author: string;
  contentAuthor: string;
  charCount: number;
  topic: string;
  unlockPoint: number;
  week: string;
  createdAt: string | null;
  locked: boolean;
  /** Rỗng nếu bị khóa. */
  imageId: string;
  videoId: string;
  shortDesc: string;
}

export const LAM_MO_PAGE_SIZE = 20;
const MAX_ITEMS = 500;
const TTL_MS = 5 * 60_000;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

/** Bản đầy đủ chỉ dùng ở máy chủ; luôn qua `project` trước khi trả cho trình duyệt. */
export type RawLamMo = Omit<LamMoItem, "locked">;

export function mapRaw(doc: Doc): RawLamMo | null {
  const d = doc.data() ?? {};
  const content = toText(d.content).trim();
  if (!content || d.active === false) return null;
  const imageId = toText(d.imageId);
  return {
    id: doc.id,
    content,
    author: toText(d.author).trim(),
    contentAuthor: toText(d.contentAuthor).trim(),
    charCount: Math.max(0, Math.floor(toNumber(d.charCount))),
    topic: toText(d.topic).trim(),
    unlockPoint: Math.max(0, toNumber(d.unlockPoint)),
    week: toText(d.week).trim(),
    createdAt: toIso(d.createdAt),
    imageId: isDriveFileId(imageId) ? imageId : "",
    videoId: youtubeId(toText(d.videoUrl)),
    shortDesc: toText(d.shortDesc).trim(),
  };
}

export function project(raw: RawLamMo, xp: number): LamMoItem {
  const locked = raw.unlockPoint > xp;
  return locked ? { ...raw, locked, imageId: "", videoId: "", shortDesc: "" } : { ...raw, locked };
}

function loadRaw(): Promise<DataResult<RawLamMo[]>> {
  return cachedResult("lammo:raw", TTL_MS, () =>
    runQuery("lammo:list", async (db) => {
      const snap = await db.collection("lamMo").orderBy("createdAt", "desc").limit(MAX_ITEMS).get();
      return snap.docs.map(mapRaw).filter((x): x is RawLamMo => x !== null);
    }),
  );
}

export interface LamMoQuery {
  q: string;
  chars: string | null;
  topic: string | null;
  milestone: string | null;
  page: number;
}

export interface LamMoPage {
  items: LamMoItem[];
  total: number;
  pages: number;
  page: number;
  unlocked: number;
  locked: number;
  chars: string[];
  topics: string[];
  milestones: string[];
}

const numeric = (a: string, b: string) => a.localeCompare(b, "vi", { numeric: true });

export function filterLamMo(items: RawLamMo[], query: LamMoQuery): RawLamMo[] {
  const needle = normalizeText(query.q);
  return items.filter((i) => {
    if (query.chars !== null && String(i.charCount) !== query.chars) return false;
    if (query.topic && i.topic !== query.topic) return false;
    if (query.milestone !== null && String(i.unlockPoint) !== query.milestone) return false;
    if (needle) {
      const hay = normalizeText([i.content, i.topic, i.shortDesc, i.author, i.contentAuthor].join(" "));
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

/** Trang lâm mô theo điểm kinh nghiệm `xp` của người xem (khách = 0). Lọc/phân trang làm ở bộ nhớ vì tối đa 500 bài. */
export async function listLamMo(query: LamMoQuery, xp: number): Promise<DataResult<LamMoPage>> {
  const raw = await loadRaw();
  if (raw.status !== "ok") return raw;
  const all = raw.data;
  const filtered = filterLamMo(all, query);
  const pages = Math.max(1, Math.ceil(filtered.length / LAM_MO_PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page), pages);
  const slice = filtered.slice((page - 1) * LAM_MO_PAGE_SIZE, page * LAM_MO_PAGE_SIZE);
  return {
    status: "ok",
    data: {
      items: slice.map((r) => project(r, xp)),
      total: filtered.length,
      pages,
      page,
      unlocked: all.filter((i) => i.unlockPoint <= xp).length,
      locked: all.filter((i) => i.unlockPoint > xp).length,
      chars: [...new Set(all.map((i) => String(i.charCount)))].sort(numeric),
      topics: [...new Set(all.map((i) => i.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")),
      milestones: [...new Set(all.map((i) => String(i.unlockPoint)))].sort(numeric),
    },
  };
}

export async function getLamMo(id: string, xp: number): Promise<DataResult<LamMoItem | null>> {
  const raw = await loadRaw();
  if (raw.status !== "ok") return raw;
  const found = raw.data.find((i) => i.id === id);
  return { status: "ok", data: found ? project(found, xp) : null };
}
