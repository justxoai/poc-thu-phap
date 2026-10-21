import "server-only";

import { cachedResult } from "@/lib/cache";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import type { Viewer } from "@/lib/session";
import type { DataResult } from "@/lib/types";

/**
 * Tài liệu tham khảo `documents/{id}`: { title, description, mark (chữ Hán trang trí), href (https://...), access: "public" | "student" | "paid", order }.
 * Đường dẫn của tài liệu cần đăng nhập/trả phí KHÔNG được gửi ra khi người xem chưa đủ quyền.
 */
export type DocumentAccess = "public" | "student" | "paid";

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  mark: string;
  access: DocumentAccess;
  allowed: boolean;
  /** Rỗng nếu không được mở. */
  href: string;
}

const MAX_ITEMS = 60;
const TTL_MS = 5 * 60_000;

type Doc = { id: string; data(): Record<string, unknown> | undefined };
type RawDocument = Omit<DocumentItem, "allowed" | "href"> & { rawHref: string; order: number };

function safeHttps(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function mapRawDocument(doc: Doc): RawDocument | null {
  const d = doc.data() ?? {};
  const title = toText(d.title).trim();
  if (!title || d.active === false) return null;
  const access = d.access === "paid" || d.access === "student" ? d.access : "public";
  return {
    id: doc.id,
    title,
    description: toText(d.description).trim(),
    mark: toText(d.mark).trim().slice(0, 2),
    access,
    rawHref: safeHttps(toText(d.href)),
    order: toNumber(d.order),
  };
}

export function documentAllowed(access: DocumentAccess, viewer: Viewer | null): boolean {
  if (access === "public") return true;
  if (access === "student") return !!viewer;
  return !!viewer && viewer.paid;
}

export function listDocuments(viewer: Viewer | null): Promise<DataResult<DocumentItem[]>> {
  return cachedResult("documents:list", TTL_MS, () =>
    runQuery("documents:list", async (db) => {
      const snap = await db.collection("documents").orderBy("order", "asc").limit(MAX_ITEMS).get();
      return snap.docs.map(mapRawDocument).filter((x): x is RawDocument => x !== null);
    }),
  ).then((result): DataResult<DocumentItem[]> => {
    if (result.status !== "ok") return result;
    return {
      status: "ok",
      data: result.data.map((raw) => {
        const allowed = documentAllowed(raw.access, viewer);
        return { id: raw.id, title: raw.title, description: raw.description, mark: raw.mark, access: raw.access, allowed, href: allowed ? raw.rawHref : "" };
      }),
    };
  });
}
