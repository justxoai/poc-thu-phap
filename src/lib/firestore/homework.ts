import "server-only";

import { isDriveFileId } from "@/lib/drive";
import { runQuery, toIso, toText } from "@/lib/firestore/run";
import type { DataResult, WorkItem } from "@/lib/types";

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapWork(doc: Doc): WorkItem | null {
  const data = doc.data() ?? {};
  const submittedAt = toIso(data.submittedAt);
  const driveFileId = toText(data.driveFileId);
  if (!submittedAt || !isDriveFileId(driveFileId)) return null;
  const score = typeof data.score === "number" && Number.isFinite(data.score) ? data.score : null;
  return {
    id: doc.id,
    studentId: toText(data.studentId),
    studentName: toText(data.studentName),
    group: toText(data.group),
    course: toText(data.course),
    driveFileId,
    description: toText(data.description),
    score,
    comment: toText(data.comment),
    submittedAt,
  };
}

function clampLimit(limit: number, max: number): number {
  return Math.min(Math.max(Math.floor(limit) || 1, 1), max);
}

/** Đọc dư vài bản ghi phòng khi có bài hỏng (thiếu ảnh/ngày) bị loại, để vẫn đủ số bài cần hiển thị. */
const SPARE = 5;

function toWorks(docs: Doc[], n: number): WorkItem[] {
  return docs
    .map(mapWork)
    .filter((w): w is WorkItem => w !== null)
    .slice(0, n);
}

/** Bài mới nhất của mọi học viên (công khai). Index tự động theo `submittedAt` là đủ. */
export function listLatestWorks(limit = 10): Promise<DataResult<WorkItem[]>> {
  const n = clampLimit(limit, 50);
  return runQuery("homework:latest", async (db) => {
    const snap = await db.collection("homework").orderBy("submittedAt", "desc").limit(n + SPARE).get();
    return toWorks(snap.docs, n);
  });
}

/** Bài của một học viên. Cần index kết hợp: studentId ASC + submittedAt DESC (firestore.indexes.json). */
export function listStudentWorks(studentId: string, limit = 50): Promise<DataResult<WorkItem[]>> {
  const n = clampLimit(limit, 100);
  return runQuery("homework:student", async (db) => {
    const snap = await db
      .collection("homework")
      .where("studentId", "==", studentId)
      .orderBy("submittedAt", "desc")
      .limit(n + SPARE)
      .get();
    return toWorks(snap.docs, n);
  });
}

/** Bài mới nhất của một tổ + khóa. Cần index kết hợp: group ASC + course ASC + submittedAt DESC. */
export function listGroupWorks(group: string, course: string, limit = 12): Promise<DataResult<WorkItem[]>> {
  const n = clampLimit(limit, 50);
  return runQuery("homework:group", async (db) => {
    const snap = await db
      .collection("homework")
      .where("group", "==", group)
      .where("course", "==", course)
      .orderBy("submittedAt", "desc")
      .limit(n + SPARE)
      .get();
    return toWorks(snap.docs, n);
  });
}
