import "server-only";

import { cachedResult } from "@/lib/cache";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { runQuery, toIso, toText } from "@/lib/firestore/run";
import { parsePostId, postHref } from "@/lib/post-id";
import type { DataResult } from "@/lib/types";
import { FieldPath } from "firebase-admin/firestore";

/**
 * Bài viết `posts/{yyyy-mm_slug}`: title, summary, thumbnail (mã tệp Drive hoặc địa chỉ https), labels[], publishedAt, html, status ("published" | "draft").
 * Danh sách chỉ đọc các trường nhẹ; `html` chỉ đọc khi mở một bài.
 */
export interface PostSummary {
  id: string;
  href: string;
  title: string;
  summary: string;
  /** Mã tệp Drive hoặc địa chỉ https; rỗng nếu không có. */
  thumbnail: string;
  labels: string[];
  publishedAt: string | null;
}

export interface PostFull extends PostSummary {
  html: string;
}

export const POSTS_PAGE_SIZE = 12;
export const POSTS_TTL_MS = 120_000;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

function labelsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 40).slice(0, 10) : [];
}

function thumbOf(value: unknown): string {
  const text = toText(value).trim();
  if (/^[A-Za-z0-9_-]{10,200}$/.test(text)) return text;
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function mapPostSummary(doc: Doc): PostSummary | null {
  const d = doc.data();
  if (!d || d.status !== "published") return null;
  const href = postHref(doc.id);
  const title = toText(d.title).trim();
  if (!href || !title) return null;
  return {
    id: doc.id,
    href,
    title,
    summary: toText(d.summary).trim().slice(0, 300),
    thumbnail: thumbOf(d.thumbnail),
    labels: labelsOf(d.labels),
    publishedAt: toIso(d.publishedAt),
  };
}

export interface PostPage {
  posts: PostSummary[];
  nextCursor: string | null;
}

/** Bài đã đăng, mới nhất trước. Cần index: (status, publishedAt DESC) và (status, labels, publishedAt DESC). */
export function listPosts(opts: { label?: string | null; cursor?: string | null; limit?: number }): Promise<DataResult<PostPage>> {
  const limit = Math.min(Math.max(opts.limit ?? POSTS_PAGE_SIZE, 1), 50);
  const cursor = isCursor(opts.cursor) ? opts.cursor : null;
  const label = opts.label ?? null;
  const key = `posts:${label ?? "*"}:${cursor ?? "first"}:${limit}`;
  return cachedResult(key, POSTS_TTL_MS, () =>
    runQuery("posts:list", async (db) => {
      let q = db.collection("posts").where("status", "==", "published");
      if (label) q = q.where("labels", "array-contains", label);
      q = q.orderBy("publishedAt", "desc").orderBy(FieldPath.documentId(), "desc");
      const c = decodeCursor(cursor);
      if (c) q = q.startAfter(c.at, c.id);
      const snap = await q.limit(limit + 1).get();
      const page = snap.docs.slice(0, limit);
      const posts = page.map((d) => mapPostSummary(d as Doc)).filter((p): p is PostSummary => p !== null);
      const last = page[page.length - 1];
      const nextCursor = snap.docs.length > limit && last ? encodeCursor(toIso(last.data().publishedAt), last.id) : null;
      return { posts, nextCursor };
    }),
  );
}

/** Một bài đầy đủ theo id; không có hoặc chưa đăng -> `null` trong data. */
export function getPost(id: string): Promise<DataResult<PostFull | null>> {
  if (!parsePostId(id)) return Promise.resolve({ status: "ok", data: null });
  return runQuery("posts:get", async (db) => {
    const doc = await db.collection("posts").doc(id).get();
    const summary = mapPostSummary(doc as Doc);
    if (!summary) return null;
    return { ...summary, html: toText(doc.data()?.html) };
  });
}
