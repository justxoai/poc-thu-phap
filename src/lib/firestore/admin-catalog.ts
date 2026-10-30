import "server-only";

import { CATALOG_KINDS, type CatalogKind } from "@/lib/catalog";
import { runQuery, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult } from "@/lib/types";

export interface CatalogItem {
  id: string;
  kind: CatalogKind;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapCatalogItem(doc: Doc): CatalogItem | null {
  const d = doc.data();
  if (!d) return null;
  const kind = CATALOG_KINDS.find((k) => k === toText(d.kind));
  const name = toText(d.name).trim();
  if (!kind || !name) return null;
  return { id: doc.id, kind, name, description: toText(d.description), price: Math.max(0, toNumber(d.price)), active: d.active !== false };
}

/** Danh mục của một loại (tối đa 200), xếp theo tên. Lọc một trường nên không cần index kết hợp. */
export function listCatalog(kind: CatalogKind): Promise<DataResult<CatalogItem[]>> {
  return runQuery("admin:catalog", async (db) => {
    const snap = await db.collection("catalog").where("kind", "==", kind).limit(200).get();
    return snap.docs
      .map((d) => mapCatalogItem(d))
      .filter((x): x is CatalogItem => x !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  });
}

export function getCatalogItem(id: string): Promise<DataResult<CatalogItem | null>> {
  return runQuery("admin:catalog-item", async (db) => {
    const snap = await db.collection("catalog").doc(id).get();
    return snap.exists ? mapCatalogItem(snap) : null;
  });
}

/** Tài liệu trả phí hiện có ở `documents` (access = paid), để nạp vào danh mục bán. Giá chưa có trong `documents` nên nạp với 0đ để thầy điền. */
export async function listPaidDocuments(): Promise<{ id: string; title: string; description: string }[]> {
  const result = await runQuery("admin:paid-documents", async (db) => {
    const snap = await db.collection("documents").where("access", "==", "paid").limit(60).get();
    return snap.docs.map((d) => ({ id: d.id, title: toText(d.data().title).trim(), description: toText(d.data().description) })).filter((x) => x.title !== "");
  });
  return result.status === "ok" ? result.data : [];
}
