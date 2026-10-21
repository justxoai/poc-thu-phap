import "server-only";

import { cachedResult } from "@/lib/cache";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import type { Viewer } from "@/lib/session";
import type { DataResult } from "@/lib/types";
import { youtubeId } from "@/lib/youtube";

/**
 * Video `videos/{id}`: { kind: "guide" | "replay", lesson, title, description, difficulty (Rank khuyến nghị), paid, youtubeId (mã hoặc URL),
 * course ("all" hoặc danh sách khóa phân tách bằng dấu phẩy), order }.
 * Mã YouTube của video chưa mở KHÔNG được gửi ra trình duyệt.
 */
export type VideoKind = "guide" | "replay";

export interface VideoItem {
  id: string;
  kind: VideoKind;
  lesson: string;
  title: string;
  description: string;
  difficulty: number;
  paid: boolean;
  course: string;
  /** Người xem hiện tại có được xem không. */
  allowed: boolean;
  /** Rỗng nếu không được xem. */
  videoId: string;
}

export const VIDEO_PAGE_SIZE = 6;
const MAX_ITEMS = 120;
const TTL_MS = 5 * 60_000;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

type RawVideo = Omit<VideoItem, "allowed" | "videoId"> & { rawVideoId: string; order: number };

export function mapRawVideo(doc: Doc, kind: VideoKind): RawVideo | null {
  const d = doc.data() ?? {};
  const title = toText(d.title).trim();
  if (!title || d.active === false) return null;
  return {
    id: doc.id,
    kind,
    lesson: toText(d.lesson).trim(),
    title,
    description: toText(d.description).trim(),
    difficulty: Math.max(0, toNumber(d.difficulty)),
    paid: d.paid === true,
    course: toText(d.course).trim() || "all",
    rawVideoId: youtubeId(toText(d.youtubeId)),
    order: toNumber(d.order),
  };
}

/** "all", "3", "1,2", "khoa 3" -> danh sách khóa chuẩn hóa. */
function courseKeys(value: string): string[] {
  return value
    .split(/[,;|/]+/)
    .map((v) => v.trim().toLowerCase().replace(/\s+/g, ""))
    .map((v) => {
      if (v === "all" || v === "tatca") return "all";
      const m = /^(?:ocd|d|khoa|k)?0*(\d+)$/.exec(v);
      return m ? String(Number(m[1])) : v;
    })
    .filter(Boolean);
}

export function matchesCourse(videoCourse: string, viewerCourse: string | undefined): boolean {
  const keys = courseKeys(videoCourse);
  if (keys.includes("all")) return true;
  const mine = viewerCourse ? courseKeys(viewerCourse)[0] : undefined;
  return !!mine && keys.includes(mine);
}

/** Quyền xem: video hướng dẫn miễn phí ai cũng xem; trả phí cần gói; video xem lại cần đăng nhập và đúng khóa. */
export function canWatch(video: Pick<RawVideo, "kind" | "paid" | "course">, viewer: Viewer | null): boolean {
  if (video.kind === "replay") return !!viewer && matchesCourse(video.course, viewer.course);
  if (!video.paid) return true;
  return !!viewer && viewer.paid;
}

export function projectVideo(raw: RawVideo, viewer: Viewer | null): VideoItem {
  const allowed = canWatch(raw, viewer);
  return {
    id: raw.id,
    kind: raw.kind,
    lesson: raw.lesson,
    title: raw.title,
    description: raw.description,
    difficulty: raw.difficulty,
    paid: raw.paid,
    course: raw.course,
    allowed,
    videoId: allowed ? raw.rawVideoId : "",
  };
}

function loadRaw(kind: VideoKind): Promise<DataResult<RawVideo[]>> {
  return cachedResult(`videos:${kind}`, TTL_MS, () =>
    runQuery(`videos:${kind}`, async (db) => {
      const snap = await db.collection("videos").where("kind", "==", kind).orderBy("order", "asc").limit(MAX_ITEMS).get();
      return snap.docs.map((d) => mapRawVideo(d, kind)).filter((x): x is RawVideo => x !== null);
    }),
  );
}

export interface VideoPage {
  items: VideoItem[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Video hướng dẫn: hiện tất cả (miễn phí + trả phí) để thấy cái đang có. Video xem lại: chỉ liệt kê khi đã đăng nhập, và chỉ của khóa người xem.
 * Index: videos kind + order (firestore.indexes.json).
 */
export async function listVideos(kind: VideoKind, viewer: Viewer | null, page: number): Promise<DataResult<VideoPage>> {
  const raw = await loadRaw(kind);
  if (raw.status !== "ok") return raw;
  const visible = kind === "replay" ? (viewer ? raw.data.filter((v) => matchesCourse(v.course, viewer.course)) : []) : raw.data;
  const pages = Math.max(1, Math.ceil(visible.length / VIDEO_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const slice = visible.slice((current - 1) * VIDEO_PAGE_SIZE, current * VIDEO_PAGE_SIZE);
  return { status: "ok", data: { items: slice.map((v) => projectVideo(v, viewer)), total: visible.length, page: current, pages } };
}

/** Một video theo id (để mở trình phát). Video xem lại của khóa khác -> null. */
export async function getVideo(kind: VideoKind, id: string, viewer: Viewer | null): Promise<DataResult<VideoItem | null>> {
  const raw = await loadRaw(kind);
  if (raw.status !== "ok") return raw;
  const found = raw.data.find((v) => v.id === id);
  if (!found || (kind === "replay" && !canWatch(found, viewer))) return { status: "ok", data: null };
  return { status: "ok", data: projectVideo(found, viewer) };
}
