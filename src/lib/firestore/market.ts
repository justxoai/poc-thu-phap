import "server-only";

import { findRarity } from "@/data/gems";
import { cachedResult } from "@/lib/cache";
import { isDriveFileId } from "@/lib/drive";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";

/** Vật phẩm Chợ phiên để hiển thị công khai (`market/{id}`). Không có thông tin người mua. */
export interface PublicMarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  rarity: string | null;
  rarityName: string;
  /** Số lượng còn; null = không giới hạn. */
  stock: number | null;
  imageId: string;
}

const MAX_ITEMS = 300;
const TTL_MS = 60_000;
const DEFAULT_CURRENCY = "Hồng Ngọc";
/** Mô tả của site cũ có thể kèm nhãn kỹ thuật [GEM:loại:số]; không hiển thị cho người dùng. */
const GEM_MARKER = /\[\s*GEM\s*:[^\]]*\]/gi;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapMarketItem(doc: Doc): PublicMarketItem | null {
  const d = doc.data() ?? {};
  const name = toText(d.name).trim();
  if (!name || d.active === false) return null;
  const rarity = findRarity(toText(d.rarity));
  const stockRaw = d.stock;
  const imageId = toText(d.imageId);
  return {
    id: doc.id,
    name,
    description: toText(d.description).replace(GEM_MARKER, "").replace(/\s{2,}/g, " ").trim(),
    price: Math.max(0, toNumber(d.price)),
    currency: toText(d.currency).trim() || DEFAULT_CURRENCY,
    rarity: rarity?.key ?? null,
    rarityName: rarity?.name ?? "",
    stock: typeof stockRaw === "number" && Number.isFinite(stockRaw) ? Math.max(0, Math.floor(stockRaw)) : null,
    imageId: isDriveFileId(imageId) ? imageId : "",
  };
}

/** Tất cả vật phẩm đang bán (tối đa 300), có bộ nhớ đệm 60 giây. Lọc/sắp xếp làm ở trang. */
export function listMarket(): Promise<DataResult<PublicMarketItem[]>> {
  return cachedResult("market:list", TTL_MS, () =>
    runQuery("market:list", async (db) => {
      const snap = await db.collection("market").limit(MAX_ITEMS).get();
      return snap.docs.map(mapMarketItem).filter((x): x is PublicMarketItem => x !== null);
    }),
  );
}
