import "server-only";

import { FieldPath, type Query } from "firebase-admin/firestore";

import { findMerchant } from "@/data/merchants";
import { parsePageRequest, type PageInfo, type PageRequest } from "@/lib/admin-paging";
import { mapMarketOrder } from "@/lib/firestore/admin-data";
import { fetchPage } from "@/lib/firestore/admin-page";
import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { runQuery, toIso } from "@/lib/firestore/run";
import { normalizeCode } from "@/lib/firestore/students";
import type { DataResult, MarketOrder } from "@/lib/types";

/** Lịch sử mua hàng tại Chợ phiên (collection `orders`): mới nhất trước, phân trang bằng con trỏ, lọc theo thương nhân và/hoặc học viên. */

type Raw = string | string[] | undefined;
const one = (v: Raw): string | undefined => (Array.isArray(v) ? v[0] : v);

export interface MarketHistoryParams extends PageRequest {
  /** Mã thương nhân (đã kiểm tra), null = tất cả. */
  merchant: string | null;
  /** Mã học viên (đã chuẩn hóa), null = tất cả. */
  student: string | null;
}

/** Địa chỉ dùng `fm` (thương nhân) và `fs` (học viên) để không đụng `merchant` (quầy đang xem) của khối vật phẩm. */
export function parseMarketHistory(params: Record<string, Raw>): MarketHistoryParams {
  const req = parsePageRequest(params);
  const merchant = findMerchant(one(params.fm) ?? "")?.id ?? null;
  const student = normalizeCode(one(params.fs))?.toUpperCase() ?? null;
  return { ...req, merchant, student };
}

export function listMarketHistory(params: MarketHistoryParams): Promise<DataResult<{ rows: MarketOrder[]; info: PageInfo }>> {
  return runQuery("admin:market-history", async (db) => {
    let filtered: Query = db.collection("orders");
    if (params.merchant) filtered = filtered.where("merchantId", "==", params.merchant);
    if (params.student) filtered = filtered.where("studentId", "==", params.student);
    const { docs, info } = await fetchPage({
      base: filtered.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc"),
      countQuery: filtered,
      req: params,
      toValues: (cursor) => {
        const c = isCursor(cursor) ? decodeCursor(cursor) : null;
        return c ? [c.at, c.id] : null;
      },
      cursorOf: (doc) => encodeCursor(toIso(doc.data().createdAt), doc.id),
    });
    const rows = docs.map((d) => mapMarketOrder(d)).filter((r): r is MarketOrder => r !== null);
    return { rows, info };
  });
}
