import "server-only";

import { findRarity } from "@/data/gems";
import { activityStatus, averageScore } from "@/lib/activity";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import { mapStudent, normalizeCode } from "@/lib/firestore/students";
import type { ActivityStatus, BookDiscount, DataResult, MarketItem, MarketOrder, PurchaseKind, PurchaseRecord, StudentPublicProfile } from "@/lib/types";
import { FieldPath, type Query } from "firebase-admin/firestore";

/** Dữ liệu cho trang quản trị. CHỈ gọi sau khi đã kiểm tra phiên quản trị (lib/admin-auth.ts). Mọi truy vấn có limit/phân trang. */

export const ADMIN_PAGE_SIZE = 50;

export interface Paged<T> {
  rows: T[];
  nextCursor: string | null;
}

type Doc = { id: string; data(): Record<string, unknown> | undefined };

async function countOf(query: Query): Promise<number> {
  return (await query.count().get()).data().count;
}

/* ---------- Tổng quan ---------- */

export interface Overview {
  students: number;
  classes: number;
  marketItems: number;
  marketOrders: number;
  book: number;
  course: number;
  document: number;
  seal: number;
}

export function getOverview(): Promise<DataResult<Overview>> {
  return runQuery("admin:overview", async (db) => {
    const purchases = db.collection("purchases");
    const [students, classes, marketItems, marketOrders, book, course, document, seal] = await Promise.all([
      countOf(db.collection("students")),
      countOf(db.collection("classCodes")),
      countOf(db.collection("market")),
      countOf(db.collection("orders")),
      countOf(purchases.where("kind", "==", "book")),
      countOf(purchases.where("kind", "==", "course")),
      countOf(purchases.where("kind", "==", "document")),
      countOf(purchases.where("kind", "==", "seal")),
    ]);
    return { students, classes, marketItems, marketOrders, book, course, document, seal };
  });
}

/* ---------- Lớp ---------- */

export interface ClassRow {
  code: string;
  group: string;
  course: string;
  members: number;
}

/** Các lớp khai báo trong `classCodes` (tối đa 100), kèm số học viên mỗi lớp. */
export function listClasses(): Promise<DataResult<ClassRow[]>> {
  return runQuery("admin:classes", async (db) => {
    const snap = await db.collection("classCodes").limit(100).get();
    const base = snap.docs
      .map((doc) => ({ code: doc.id, group: toText(doc.data().group), course: toText(doc.data().course) }))
      .filter((c) => c.group && c.course);
    const rows = await Promise.all(
      base.map(async (c): Promise<ClassRow> => ({
        ...c,
        members: await countOf(db.collection("students").where("group", "==", c.group).where("course", "==", c.course)),
      })),
    );
    return rows.sort((a, b) => a.course.localeCompare(b.course, "vi", { numeric: true }) || a.group.localeCompare(b.group, "vi", { numeric: true }));
  });
}

/* ---------- Học viên ---------- */

export interface StudentRow {
  id: string;
  name: string;
  group: string;
  course: string;
  wallet: Record<string, number>;
  submissionCount: number;
  average: number;
  lastSubmittedAt: string | null;
  activity: ActivityStatus;
}

export interface StudentFilter {
  group: string | null;
  course: string | null;
  /** Mã học viên cuối của trang trước. */
  after: string | null;
}

const LABEL = /^[0-9A-Za-z_-]{1,10}$/;

export function parseStudentFilter(params: { group?: string; course?: string; after?: string }): StudentFilter {
  return {
    group: params.group && LABEL.test(params.group) ? params.group : null,
    course: params.course && LABEL.test(params.course) ? params.course : null,
    after: params.after ? normalizeCode(params.after) : null,
  };
}

export function mapStudentRow(profile: StudentPublicProfile, now: Date): StudentRow {
  return {
    id: profile.id,
    name: profile.name,
    group: profile.group,
    course: profile.course,
    wallet: profile.wallet,
    submissionCount: profile.stats.submissionCount,
    average: averageScore(profile.stats),
    lastSubmittedAt: profile.stats.lastSubmittedAt,
    activity: activityStatus(profile.stats.lastSubmittedAt, now),
  };
}

/** Học viên theo mã (không cần index kết hợp: lọc bằng bằng + sắp xếp theo id). */
export function listStudents(filter: StudentFilter, now: Date = new Date()): Promise<DataResult<Paged<StudentRow>>> {
  return runQuery("admin:students", async (db) => {
    let q: Query = db.collection("students");
    if (filter.group) q = q.where("group", "==", filter.group);
    if (filter.course) q = q.where("course", "==", filter.course);
    q = q.orderBy(FieldPath.documentId());
    if (filter.after) q = q.startAfter(filter.after);
    const snap = await q.limit(ADMIN_PAGE_SIZE + 1).get();
    const page = snap.docs.slice(0, ADMIN_PAGE_SIZE);
    const rows = page
      .map((doc) => mapStudent(doc as Doc))
      .filter((s): s is StudentPublicProfile => s !== null)
      .map((s) => mapStudentRow(s, now));
    const nextCursor = snap.docs.length > ADMIN_PAGE_SIZE && page.length > 0 ? page[page.length - 1].id : null;
    return { rows, nextCursor };
  });
}

/* ---------- Mua sách / đăng ký khóa học / mua tài liệu ---------- */

export function mapPurchase(doc: Doc): PurchaseRecord | null {
  const data = doc.data();
  if (!data) return null;
  const kind = toText(data.kind);
  if (kind !== "book" && kind !== "course" && kind !== "document" && kind !== "seal") return null;
  const discount = toText(data.discount);
  return {
    id: doc.id,
    kind,
    name: toText(data.name),
    phone: toText(data.phone),
    email: toText(data.email),
    address: toText(data.address),
    zalo: toText(data.zalo),
    item: toText(data.item),
    quantity: toNumber(data.quantity, 1),
    promoCode: toText(data.promoCode),
    discount: discount === "student" || discount === "early" || discount === "none" ? (discount as BookDiscount) : "",
    unitPrice: toNumber(data.unitPrice),
    total: toNumber(data.total),
    note: toText(data.note),
    status: toText(data.status) || "new",
    createdAt: toIso(data.createdAt),
  };
}

/** Một trang đơn mới nhất của một loại. Cần index kết hợp: kind + createdAt DESC (firestore.indexes.json). */
export function listPurchases(kind: PurchaseKind, cursor: string | null): Promise<DataResult<Paged<PurchaseRecord>>> {
  return runQuery("admin:purchases", async (db) => {
    let q = db.collection("purchases").where("kind", "==", kind).orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
    const c = decodeCursor(isCursor(cursor) ? cursor : null);
    if (c) q = q.startAfter(c.at, c.id);
    const snap = await q.limit(ADMIN_PAGE_SIZE + 1).get();
    const page = snap.docs.slice(0, ADMIN_PAGE_SIZE);
    const rows = page.map((d) => mapPurchase(d as Doc)).filter((r): r is PurchaseRecord => r !== null);
    const last = page[page.length - 1];
    const nextCursor = snap.docs.length > ADMIN_PAGE_SIZE && last ? encodeCursor(toIso(last.data().createdAt), last.id) : null;
    return { rows, nextCursor };
  });
}

/* ---------- Chợ phiên ---------- */

export function mapMarketItem(doc: Doc): MarketItem | null {
  const data = doc.data();
  if (!data) return null;
  return {
    id: doc.id,
    name: toText(data.name) || doc.id,
    price: toNumber(data.price),
    currency: toText(data.currency),
    stock: toNumber(data.stock),
    active: data.active !== false,
    description: toText(data.description).replace(/\[\s*GEM\s*:[^\]]*\]/gi, "").trim(),
    rarity: findRarity(toText(data.rarity))?.key ?? "",
    imageId: toText(data.imageId),
  };
}

export function listMarketItems(): Promise<DataResult<MarketItem[]>> {
  return runQuery("admin:market-items", async (db) => {
    const snap = await db.collection("market").limit(200).get();
    return snap.docs
      .map((d) => mapMarketItem(d as Doc))
      .filter((i): i is MarketItem => i !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  });
}

export function mapMarketOrder(doc: Doc): MarketOrder | null {
  const data = doc.data();
  if (!data) return null;
  return {
    id: doc.id,
    studentId: toText(data.studentId),
    studentName: toText(data.studentName),
    itemName: toText(data.itemName),
    quantity: toNumber(data.quantity, 1),
    cost: toNumber(data.cost),
    currency: toText(data.currency),
    status: toText(data.status),
    createdAt: toIso(data.createdAt),
  };
}

/** Lịch sử đổi quà ở Chợ phiên, mới nhất trước. Index theo createdAt là tự động. */
export function listMarketOrders(cursor: string | null): Promise<DataResult<Paged<MarketOrder>>> {
  return runQuery("admin:market-orders", async (db) => {
    let q = db.collection("orders").orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
    const c = decodeCursor(isCursor(cursor) ? cursor : null);
    if (c) q = q.startAfter(c.at, c.id);
    const snap = await q.limit(ADMIN_PAGE_SIZE + 1).get();
    const page = snap.docs.slice(0, ADMIN_PAGE_SIZE);
    const rows = page.map((d) => mapMarketOrder(d as Doc)).filter((r): r is MarketOrder => r !== null);
    const last = page[page.length - 1];
    const nextCursor = snap.docs.length > ADMIN_PAGE_SIZE && last ? encodeCursor(toIso(last.data().createdAt), last.id) : null;
    return { rows, nextCursor };
  });
}
