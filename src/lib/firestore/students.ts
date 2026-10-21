import "server-only";

import { activityStatus, averageScore } from "@/lib/activity";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type {
  DataResult,
  GroupMemberRow,
  InventoryItem,
  StudentPublicProfile,
  StudentStats,
} from "@/lib/types";

const CODE = /^[A-Za-z0-9_-]{1,40}$/;

/** Chuẩn hóa mã nhập vào (bỏ khoảng trắng). Trả null nếu có ký tự không hợp lệ, để không dùng làm đường dẫn document. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/\s+/g, "");
  return CODE.test(code) ? code : null;
}

type Doc = { id: string; data(): Record<string, unknown> | undefined };

function mapStats(raw: unknown): StudentStats {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    submissionCount: toNumber(s.submissionCount),
    gradedCount: toNumber(s.gradedCount),
    scoreSum: toNumber(s.scoreSum),
    lastSubmittedAt: toIso(s.lastSubmittedAt),
  };
}

function mapWallet(raw: unknown): Record<string, number> {
  const wallet: Record<string, number> = {};
  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value)) wallet[key] = value;
    }
  }
  return wallet;
}

function mapInventory(raw: unknown): InventoryItem[] {
  const items: InventoryItem[] = [];
  if (raw && typeof raw === "object") {
    for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
      const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
      const quantity = toNumber(v.quantity);
      if (quantity > 0) items.push({ id, name: toText(v.name) || id, quantity });
    }
  }
  return items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

/**
 * Chỉ chọn các trường an toàn để công khai. Dữ liệu cá nhân (điện thoại, email, địa chỉ, ngày sinh)
 * có thể nằm trong cùng document nhưng KHÔNG được đọc ra ở đây.
 */
export function mapStudent(doc: Doc): StudentPublicProfile | null {
  const data = doc.data();
  if (!data) return null;
  return {
    id: doc.id,
    name: toText(data.name),
    group: toText(data.group),
    course: toText(data.course),
    wallet: mapWallet(data.wallet),
    inventory: mapInventory(data.inventory),
    stats: mapStats(data.stats),
  };
}

export function getStudentProfile(code: string): Promise<DataResult<StudentPublicProfile | null>> {
  return runQuery("students:get", async (db) => {
    const snap = await db.collection("students").doc(code).get();
    return snap.exists ? mapStudent(snap) : null;
  });
}

/** Danh sách học viên cùng tổ + khóa (tối đa 300), kèm điểm trung bình và trạng thái hoạt động. */
export function listGroupMembers(
  group: string,
  course: string,
  now: Date = new Date(),
): Promise<DataResult<GroupMemberRow[]>> {
  return runQuery("students:group", async (db) => {
    const snap = await db
      .collection("students")
      .where("group", "==", group)
      .where("course", "==", course)
      .limit(300)
      .get();
    return snap.docs
      .map(mapStudent)
      .filter((s): s is StudentPublicProfile => s !== null)
      .map(
        (s): GroupMemberRow => ({
          id: s.id,
          name: s.name,
          average: averageScore(s.stats),
          submissionCount: s.stats.submissionCount,
          activity: activityStatus(s.stats.lastSubmittedAt, now),
        }),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  });
}

/** Mã tra cứu của cán sự lớp lưu trong `classCodes/{mã}` -> { group, course }. Mã là dữ liệu, không suy ra từ định dạng. */
export function getClassByCode(code: string): Promise<DataResult<{ group: string; course: string } | null>> {
  return runQuery("classCodes:get", async (db) => {
    const snap = await db.collection("classCodes").doc(code).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    const group = toText(data.group);
    const course = toText(data.course);
    return group && course ? { group, course } : null;
  });
}
