import "server-only";

import { FieldPath, type Query } from "firebase-admin/firestore";

import { type PageInfo, type PageRequest, parsePageRequest } from "@/lib/admin-paging";
import { fetchPage } from "@/lib/firestore/admin-page";
import { mapStudentRow, type StudentRow } from "@/lib/firestore/admin-data";
import { listStudentWorks } from "@/lib/firestore/homework";
import { runQuery } from "@/lib/firestore/run";
import { getAdminContact, type AdminContact } from "@/lib/firestore/accounts";
import { getStudentProfile, mapStudent, normalizeCode } from "@/lib/firestore/students";
import type { DataResult, StudentPublicProfile, WorkItem } from "@/lib/types";

/** Danh sách học viên của khu quản trị: lọc Khóa/Tổ, tìm theo mã hoặc đầu họ tên, phân trang theo con trỏ. */

export interface StudentListParams extends PageRequest {
  q: string | null;
  group: string | null;
  course: string | null;
}

const LABEL = /^[0-9A-Za-z_-]{1,10}$/;
/** Mã học viên: 2-3 chữ cái + số (TT00012, HV1). Còn lại coi là họ tên. */
const CODE_LIKE = /^[A-Za-z]{2,3}\d+$/;

type Raw = string | string[] | undefined;
const one = (v: Raw): string | undefined => (Array.isArray(v) ? v[0] : v);

function cleanQuery(value: string | undefined): string | null {
  const text = (value ?? "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return text === "" ? null : text;
}

export function parseStudentList(params: Record<string, Raw>): StudentListParams {
  const group = one(params.group);
  const course = one(params.course);
  return {
    ...parsePageRequest(params),
    q: cleanQuery(one(params.q)),
    group: group && LABEL.test(group) ? group : null,
    course: course && LABEL.test(course) ? course : null,
  };
}

/** "nguyễn văn an" -> "Nguyễn Văn An" (tên lưu có viết hoa đầu từ; tìm theo đầu chuỗi phân biệt hoa/thường). */
export function titleCase(text: string): string {
  return text.replace(/(^|\s)(\S)/gu, (_m, space: string, ch: string) => `${space}${ch.toLocaleUpperCase("vi")}`);
}

export type StudentListRow = StudentRow & { isAdmin: boolean };

export function listStudentsPage(params: StudentListParams, now: Date = new Date()): Promise<DataResult<{ rows: StudentListRow[]; info: PageInfo }>> {
  return runQuery("admin:students-page", async (db) => {
    let filtered: Query = db.collection("students");
    if (params.group) filtered = filtered.where("group", "==", params.group);
    if (params.course) filtered = filtered.where("course", "==", params.course);

    const q = params.q;
    let countQuery = filtered;
    let base: Query;
    let toValues: (cursor: string) => unknown[] | null;
    let cursorOf: (doc: { id: string; data(): Record<string, unknown> }) => string | null;
    if (q && CODE_LIKE.test(q)) {
      const prefix = q.toUpperCase();
      countQuery = filtered.where(FieldPath.documentId(), ">=", prefix).where(FieldPath.documentId(), "<", `${prefix}`);
      base = countQuery.orderBy(FieldPath.documentId());
      toValues = (cursor) => {
        const id = normalizeCode(cursor);
        return id ? [id] : null;
      };
      cursorOf = (doc) => doc.id;
    } else if (q) {
      const prefix = titleCase(q);
      countQuery = filtered.where("name", ">=", prefix).where("name", "<", `${prefix}`);
      base = countQuery.orderBy("name").orderBy(FieldPath.documentId());
      toValues = (cursor) => {
        const dot = cursor.lastIndexOf(".");
        const id = dot > 0 ? normalizeCode(cursor.slice(dot + 1)) : null;
        if (!id) return null;
        try {
          return [decodeURIComponent(cursor.slice(0, dot)), id];
        } catch {
          return null;
        }
      };
      cursorOf = (doc) => `${encodeURIComponent(String(doc.data().name ?? ""))}.${doc.id}`;
    } else {
      base = filtered.orderBy(FieldPath.documentId());
      toValues = (cursor) => {
        const id = normalizeCode(cursor);
        return id ? [id] : null;
      };
      cursorOf = (doc) => doc.id;
    }

    const { docs, info } = await fetchPage({ base, countQuery, req: params, toValues, cursorOf });
    const rows = docs
      .map((doc) => {
        const profile = mapStudent(doc);
        return profile ? { ...mapStudentRow(profile, now), isAdmin: doc.data().role === "admin" } : null;
      })
      .filter((r): r is StudentListRow => r !== null);
    return { rows, info };
  });
}

/* ---------- Chi tiết một học viên (popup 3 tab) ---------- */

export interface StudentAdminDetail {
  profile: StudentPublicProfile;
  contact: AdminContact;
  works: WorkItem[];
}

/** Hồ sơ + liên hệ + 50 bài mới nhất của một học viên. Dùng chung cho "Học viên" và "Học viên mới". */
export async function getStudentAdminDetail(rawId: unknown): Promise<DataResult<StudentAdminDetail | null>> {
  const id = normalizeCode(rawId);
  if (!id) return { status: "ok", data: null };
  const [profile, contact, works] = await Promise.all([getStudentProfile(id), getAdminContact(id), listStudentWorks(id, 50)]);
  if (profile.status !== "ok") return profile;
  if (contact.status !== "ok") return contact;
  if (!profile.data || !contact.data) return { status: "ok", data: null };
  return { status: "ok", data: { profile: profile.data, contact: contact.data, works: works.status === "ok" ? works.data : [] } };
}
