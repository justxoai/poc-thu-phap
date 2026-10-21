import "server-only";

import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { Viewer } from "@/lib/session";
import type { DataResult } from "@/lib/types";

/** Liên kết phòng học trực tuyến `settings/rooms`: { "hoa-binh": "https://meet...", "hanh-phuc": "https://meet..." }. Chỉ phát cho người đã đăng nhập. */
export type RoomLinks = Record<string, string>;

function safeHttps(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function getRoomLinks(viewer: Viewer | null): Promise<DataResult<RoomLinks>> {
  // Khách không bao giờ nhận liên kết; cũng không cần đọc Firestore.
  if (!viewer) return Promise.resolve({ status: "ok", data: {} });
  return runQuery("lecture:rooms", async (db) => {
    const data = (await db.collection("settings").doc("rooms").get()).data() ?? {};
    const links: RoomLinks = {};
    for (const id of ["hoa-binh", "hanh-phuc"]) {
      const url = safeHttps(toText(data[id]));
      if (url) links[id] = url;
    }
    return links;
  });
}

/** Bài lâm mô học viên vừa góp (`lamMoContributions/{id}`: title, authorName, group, course, hearts, lamMoId?, approved, createdAt). */
export interface Contribution {
  id: string;
  title: string;
  authorName: string;
  group: string;
  course: string;
  hearts: number;
  lamMoId: string;
  createdAt: string | null;
}

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapContribution(doc: Doc): Contribution | null {
  const d = doc.data() ?? {};
  const title = toText(d.title).trim();
  if (!title || d.approved === false) return null;
  const lamMoId = toText(d.lamMoId);
  return {
    id: doc.id,
    title,
    authorName: toText(d.authorName).trim(),
    group: toText(d.group),
    course: toText(d.course),
    hearts: Math.max(0, Math.floor(toNumber(d.hearts))),
    lamMoId: /^[A-Za-z0-9_-]{1,64}$/.test(lamMoId) ? lamMoId : "",
    createdAt: toIso(d.createdAt),
  };
}

export const CONTRIBUTION_LIMIT = 8;

export function listContributions(): Promise<DataResult<Contribution[]>> {
  return runQuery("lecture:contributions", async (db) => {
    const snap = await db.collection("lamMoContributions").orderBy("createdAt", "desc").limit(CONTRIBUTION_LIMIT + 4).get();
    return snap.docs
      .map(mapContribution)
      .filter((x): x is Contribution => x !== null)
      .slice(0, CONTRIBUTION_LIMIT);
  });
}
