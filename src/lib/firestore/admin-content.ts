import "server-only";

import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { mapTransaction, type TransactionRecord } from "@/lib/firestore/ledger";
import { mapWork } from "@/lib/firestore/homework";
import { runQuery, toIso, toText } from "@/lib/firestore/run";
import type { DataResult, WorkItem } from "@/lib/types";
import { postHref } from "@/lib/post-id";
import { FieldPath } from "firebase-admin/firestore";

/** Dữ liệu đọc cho các tab mới của khu thầy (ví, chấm bài, tin tức). CHỈ gọi sau khi đã kiểm tra phiên quản trị. */

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export interface AdminTransaction extends TransactionRecord {
  studentId: string;
}

export const ADMIN_LEDGER_PAGE = 50;

/** Sổ cái toàn trường, mới nhất trước (index theo createdAt là tự động). */
export function listAllTransactions(cursor: string | null): Promise<DataResult<{ rows: AdminTransaction[]; nextCursor: string | null }>> {
  return runQuery("admin:ledger", async (db) => {
    let q = db.collection("transactions").orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
    const c = decodeCursor(isCursor(cursor) ? cursor : null);
    if (c) q = q.startAfter(c.at, c.id);
    const snap = await q.limit(ADMIN_LEDGER_PAGE + 1).get();
    const page = snap.docs.slice(0, ADMIN_LEDGER_PAGE);
    const rows = page
      .map((d) => {
        const t = mapTransaction(d as Doc);
        return t ? { ...t, studentId: toText(d.data().studentId) } : null;
      })
      .filter((r): r is AdminTransaction => r !== null);
    const last = page[page.length - 1];
    const nextCursor = snap.docs.length > ADMIN_LEDGER_PAGE && last ? encodeCursor(toIso(last.data().createdAt), last.id) : null;
    return { rows, nextCursor };
  });
}

export const GRADE_BATCH = 100;

/** 100 bài mới nhất; bài chưa chấm xếp trước. (Chưa lọc "chưa chấm" ở truy vấn vì dữ liệu cũ không có trường `graded`.) */
export function listWorksToGrade(): Promise<DataResult<WorkItem[]>> {
  return runQuery("admin:grade", async (db) => {
    const snap = await db.collection("homework").orderBy("submittedAt", "desc").limit(GRADE_BATCH).get();
    const works = snap.docs.map((d) => mapWork(d as Doc)).filter((w): w is WorkItem => w !== null);
    return [...works.filter((w) => w.score === null), ...works.filter((w) => w.score !== null)];
  });
}

export interface AdminPostRow {
  id: string;
  href: string | null;
  title: string;
  status: string;
  labels: string[];
  publishedAt: string | null;
}

export function listPostsAdmin(): Promise<DataResult<AdminPostRow[]>> {
  return runQuery("admin:posts", async (db) => {
    const snap = await db.collection("posts").orderBy("publishedAt", "desc").limit(50).get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        href: postHref(d.id),
        title: toText(data.title) || d.id,
        status: toText(data.status) === "published" ? "published" : "draft",
        labels: Array.isArray(data.labels) ? data.labels.filter((x: unknown): x is string => typeof x === "string") : [],
        publishedAt: toIso(data.publishedAt),
      };
    });
  });
}

export interface PostEditData {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  labels: string[];
  date: string;
  html: string;
  status: "published" | "draft";
}

export function getPostForEdit(id: string): Promise<DataResult<PostEditData | null>> {
  return runQuery("admin:post-edit", async (db) => {
    const snap = await db.collection("posts").doc(id).get();
    const d = snap.data();
    if (!snap.exists || !d) return null;
    const iso = toIso(d.publishedAt);
    return {
      id,
      title: toText(d.title),
      summary: toText(d.summary),
      thumbnail: toText(d.thumbnail),
      labels: Array.isArray(d.labels) ? d.labels.filter((x: unknown): x is string => typeof x === "string") : [],
      date: iso ? new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }) : "",
      html: toText(d.html),
      status: toText(d.status) === "published" ? "published" : "draft",
    };
  });
}
