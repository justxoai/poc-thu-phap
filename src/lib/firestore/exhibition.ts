import "server-only";

import { isDriveFileId } from "@/lib/drive";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";
import { FieldPath } from "firebase-admin/firestore";

/** Tác phẩm triển lãm trả cho trình duyệt: không có điểm số, nhận xét hay mã học viên (site cũ cũng ẩn các trường này). */
export interface ExhibitionWork {
  id: string;
  studentName: string;
  group: string;
  course: string;
  driveFileId: string;
  description: string;
  submittedAt: string;
  /** Avatar/khung của học viên (chưa có trong dữ liệu `homework`; trống thì hiện chữ cái đầu mặc định). */
  decor?: { avatar: string; frame: string; background: string };
  /** Ảnh nằm trong `public/` (chỉ bộ mẫu dùng). Dữ liệu thật dùng `driveFileId`. */
  imageSrc?: string;
}

export interface ExhibitionPage {
  items: ExhibitionWork[];
  /** Chuỗi con trỏ cho trang kế tiếp, hoặc null nếu hết. */
  nextCursor: string | null;
}

export interface ExhibitionMeta {
  works: number;
  students: number;
  groups: string[];
  courses: string[];
}

export type ExhibitionSort = "newest" | "oldest";

export interface ExhibitionQuery {
  course: string | null;
  group: string | null;
  sort: ExhibitionSort;
  cursor: string | null;
}

export const EXHIBITION_PAGE_SIZE = 24;

const LABEL = /^[0-9A-Za-z_-]{1,10}$/;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

/** Đọc tham số từ URL một cách chặt chẽ; giá trị lạ bị bỏ (không báo lỗi) để đường dẫn cache ổn định. */
export function parseExhibitionParams(params: { get(name: string): string | null }): ExhibitionQuery {
  const pick = (name: string) => {
    const v = params.get(name);
    return v && LABEL.test(v) ? v : null;
  };
  const cursor = params.get("cursor");
  return {
    course: pick("khoa"),
    group: pick("to"),
    sort: params.get("sort") === "oldest" ? "oldest" : "newest",
    cursor: isCursor(cursor) ? cursor : null,
  };
}

export function mapExhibitionWork(doc: Doc): ExhibitionWork | null {
  const data = doc.data() ?? {};
  const submittedAt = toIso(data.submittedAt);
  const driveFileId = toText(data.driveFileId);
  if (!submittedAt || !isDriveFileId(driveFileId)) return null;
  return {
    id: doc.id,
    studentName: toText(data.studentName),
    group: toText(data.group),
    course: toText(data.course),
    driveFileId,
    description: toText(data.description),
    submittedAt,
  };
}

/**
 * Tác phẩm triển lãm = document `homework` có `featured: true` (ghi sẵn khi chấm, xem lib/exhibition-rule.ts).
 * Index kết hợp cần có (firestore.indexes.json): featured + [course] + [group] + submittedAt.
 * Chỉ đọc đúng một trang (24 bài), không bao giờ đọc cả collection.
 */
export function listExhibition(query: ExhibitionQuery): Promise<DataResult<ExhibitionPage>> {
  return runQuery("exhibition:list", async (db) => {
    const dir = query.sort === "oldest" ? "asc" : "desc";
    let q = db.collection("homework").where("featured", "==", true);
    if (query.course) q = q.where("course", "==", query.course);
    if (query.group) q = q.where("group", "==", query.group);
    q = q.orderBy("submittedAt", dir).orderBy(FieldPath.documentId(), dir);

    const cursor = decodeCursor(query.cursor);
    if (cursor) q = q.startAfter(cursor.at, cursor.id);

    const snap = await q.limit(EXHIBITION_PAGE_SIZE + 1).get();
    const page = snap.docs.slice(0, EXHIBITION_PAGE_SIZE);
    const items = page.map(mapExhibitionWork).filter((w): w is ExhibitionWork => w !== null);

    const last = page[page.length - 1];
    const nextCursor = snap.docs.length > EXHIBITION_PAGE_SIZE && last ? encodeCursor(toIso(last.data().submittedAt), last.id) : null;
    return { items, nextCursor };
  });
}

function labelList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => toText(v))
    .filter((v) => LABEL.test(v))
    .sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
}

/**
 * Số liệu tổng hợp `meta/exhibition` { works, students, groups[], courses[] } do bước chấm bài/nhập dữ liệu cập nhật.
 * Không có thì trả null (trang vẫn chạy, chỉ thiếu các ô thống kê).
 */
export function getExhibitionMeta(): Promise<DataResult<ExhibitionMeta | null>> {
  return runQuery("exhibition:meta", async (db) => {
    const snap = await db.collection("meta").doc("exhibition").get();
    const data = snap.data();
    if (!snap.exists || !data) return null;
    return {
      works: toNumber(data.works),
      students: toNumber(data.students),
      groups: labelList(data.groups),
      courses: labelList(data.courses),
    };
  });
}
