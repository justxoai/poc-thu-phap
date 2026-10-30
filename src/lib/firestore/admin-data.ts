import "server-only";

import { findMerchant } from "@/data/merchants";
import { findRarity } from "@/data/gems";
import { findItemImage } from "@/data/item-images";
import { activityStatus, averageScore } from "@/lib/activity";
import type { PageInfo, PageRequest } from "@/lib/admin-paging";
import { fetchPage } from "@/lib/firestore/admin-page";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { ActivityStatus, BookDiscount, DataResult, MarketItem, MarketOrder, PurchaseKind, PurchaseRecord, StudentPublicProfile } from "@/lib/types";
import { FieldPath, type Query } from "firebase-admin/firestore";

/** Dữ liệu cho trang quản trị. CHỈ gọi sau khi đã kiểm tra phiên quản trị (lib/admin-guard.ts: role admin). Mọi truy vấn có limit/phân trang. */

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

/** Một trang đơn của một loại, mới nhất trước, phân trang bằng con trỏ. Cần index kết hợp: kind + createdAt DESC (firestore.indexes.json). */
export function listPurchasesPage(kind: PurchaseKind, req: PageRequest): Promise<DataResult<{ rows: PurchaseRecord[]; info: PageInfo }>> {
  return runQuery("admin:purchases", async (db) => {
    const where = db.collection("purchases").where("kind", "==", kind);
    const { docs, info } = await fetchPage({
      base: where.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc"),
      countQuery: where,
      req,
      toValues: (cursor) => {
        const c = isCursor(cursor) ? decodeCursor(cursor) : null;
        return c ? [c.at, c.id] : null;
      },
      cursorOf: (doc) => encodeCursor(toIso(doc.data().createdAt), doc.id),
    });
    return { rows: docs.map((d) => mapPurchase(d)).filter((r): r is PurchaseRecord => r !== null), info };
  });
}

/* ---------- Chợ phiên ---------- */

export function mapMarketItem(doc: Doc): MarketItem | null {
  const data = doc.data();
  if (!data) return null;
  const percent = Math.floor(toNumber(data.promoPercent));
  const stock = data.stock;
  return {
    id: doc.id,
    name: toText(data.name) || doc.id,
    price: toNumber(data.price),
    currency: toText(data.currency),
    stock: typeof stock === "number" && Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : null,
    active: data.active !== false,
    description: toText(data.description).replace(/\[\s*GEM\s*:[^\]]*\]/gi, "").trim(),
    rarity: findRarity(toText(data.rarity))?.key ?? "",
    imageId: toText(data.imageId),
    image: findItemImage(toText(data.image))?.src ?? "",
    merchantId: findMerchant(toText(data.merchantId))?.id ?? "",
    promo: data.promo === true && percent >= 1 && percent <= 99,
    promoPercent: percent >= 1 && percent <= 99 ? percent : 0,
  };
}

/** Tất cả vật phẩm (tối đa 300; 9 thương nhân × vài chục món là đủ), xếp theo tên. */
export function listMarketItems(): Promise<DataResult<MarketItem[]>> {
  return runQuery("admin:market-items", async (db) => {
    const snap = await db.collection("market").limit(300).get();
    return snap.docs
      .map((d) => mapMarketItem(d as Doc))
      .filter((i): i is MarketItem => i !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  });
}

/** Một vật phẩm để sửa (mở bằng ?edit=ID). */
export function getMarketItem(id: string): Promise<DataResult<MarketItem | null>> {
  return runQuery("admin:market-item", async (db) => {
    const snap = await db.collection("market").doc(id).get();
    return snap.exists ? mapMarketItem(snap as Doc) : null;
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
    merchantId: findMerchant(toText(data.merchantId))?.id ?? "",
    quantity: toNumber(data.quantity, 1),
    cost: toNumber(data.cost),
    currency: toText(data.currency),
    status: toText(data.status),
    createdAt: toIso(data.createdAt),
  };
}
