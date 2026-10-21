import "server-only";

import { createHash } from "node:crypto";

import { runQuery } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

/** Số bài tối đa mỗi học viên được nộp trong một ngày (giờ Việt Nam). */
export const HOMEWORK_PER_DAY = 10;

export interface HomeworkInput {
  studentId: string;
  studentName: string;
  group: string;
  course: string;
  /** Mã tệp Drive đã qua `extractDriveFileId`. */
  driveFileId: string;
  description: string;
}

export type SubmitOutcome = "created" | "duplicate" | "limit";

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** 00:00 hôm nay theo giờ Việt Nam (UTC+7), trả về Date theo UTC. */
export function startOfVnDay(now = Date.now()): Date {
  const local = now + VN_OFFSET_MS;
  return new Date(local - (local % 86_400_000) - VN_OFFSET_MS);
}

/** Id xác định theo (học viên, tệp) để nộp lại cùng một tệp không tạo bài thứ hai. */
export function homeworkId(studentId: string, driveFileId: string): string {
  return createHash("sha256").update(`homework\u0001${studentId}\u0001${driveFileId}`).digest("hex").slice(0, 28);
}

/**
 * Ghi bài nộp và tăng số bài/ngày nộp gần nhất của học viên trong CÙNG một transaction,
 * để thống kê không lệch với danh sách bài. `studentId` phải lấy từ phiên đăng nhập, không từ biểu mẫu.
 */
export function submitHomework(input: HomeworkInput, now = Date.now()): Promise<DataResult<SubmitOutcome>> {
  return runQuery("homework:submit", async (db) => {
    const since = startOfVnDay(now);
    const today = await db.collection("homework").where("studentId", "==", input.studentId).where("submittedAt", ">=", since).count().get();
    if (today.data().count >= HOMEWORK_PER_DAY) return "limit" as SubmitOutcome;

    const ref = db.collection("homework").doc(homeworkId(input.studentId, input.driveFileId));
    const studentRef = db.collection("students").doc(input.studentId);
    return db.runTransaction(async (t): Promise<SubmitOutcome> => {
      const [existing, student] = await Promise.all([t.get(ref), t.get(studentRef)]);
      if (existing.exists) return "duplicate";
      if (!student.exists) throw new Error("student-not-found");
      t.create(ref, {
        studentId: input.studentId,
        studentName: input.studentName,
        group: input.group,
        course: input.course,
        driveFileId: input.driveFileId,
        description: input.description,
        score: null,
        comment: "",
        graded: false,
        submittedAt: FieldValue.serverTimestamp(),
      });
      t.update(studentRef, { "stats.submissionCount": FieldValue.increment(1), "stats.lastSubmittedAt": FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      return "created";
    });
  });
}
