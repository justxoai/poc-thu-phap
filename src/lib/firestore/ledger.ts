import "server-only";

import { decodeCursor, encodeCursor, isCursor } from "@/lib/firestore/cursor";
import { mapMarketOrder } from "@/lib/firestore/admin-data";
import { runQuery, toIso, toNumber, toText } from "@/lib/firestore/run";
import type { DataResult, MarketOrder } from "@/lib/types";
import { FieldPath } from "firebase-admin/firestore";

/** Một dòng sổ cái `transactions/{id}` của chính học viên (không có tên người khác). */
export interface TransactionRecord {
  id: string;
  currency: string;
  amount: number;
  balanceAfter: number;
  source: string;
  note: string;
  createdAt: string | null;
}

export const LEDGER_PAGE = 30;

type Doc = { id: string; data(): Record<string, unknown> | undefined };

export function mapTransaction(doc: Doc): TransactionRecord | null {
  const d = doc.data();
  if (!d) return null;
  return {
    id: doc.id,
    currency: toText(d.currency),
    amount: toNumber(d.amount),
    balanceAfter: toNumber(d.balanceAfter),
    source: toText(d.source),
    note: toText(d.note),
    createdAt: toIso(d.createdAt),
  };
}

export interface Page<T> {
  rows: T[];
  nextCursor: string | null;
}

/** Sổ cái của một học viên, mới nhất trước. Cần index: studentId ASC + createdAt DESC (firestore.indexes.json). */
export function listTransactions(studentId: string, cursor: string | null): Promise<DataResult<Page<TransactionRecord>>> {
  return runQuery("ledger:student", async (db) => {
    let q = db.collection("transactions").where("studentId", "==", studentId).orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
    const c = decodeCursor(isCursor(cursor) ? cursor : null);
    if (c) q = q.startAfter(c.at, c.id);
    const snap = await q.limit(LEDGER_PAGE + 1).get();
    const page = snap.docs.slice(0, LEDGER_PAGE);
    const rows = page.map((d) => mapTransaction(d as Doc)).filter((r): r is TransactionRecord => r !== null);
    const last = page[page.length - 1];
    const nextCursor = snap.docs.length > LEDGER_PAGE && last ? encodeCursor(toIso(last.data().createdAt), last.id) : null;
    return { rows, nextCursor };
  });
}

/** Đơn đổi quà của một học viên (tối đa 50, mới nhất trước). Cần index: studentId ASC + createdAt DESC. */
export function listStudentOrders(studentId: string): Promise<DataResult<MarketOrder[]>> {
  return runQuery("orders:student", async (db) => {
    const snap = await db.collection("orders").where("studentId", "==", studentId).orderBy("createdAt", "desc").limit(50).get();
    return snap.docs.map((d) => mapMarketOrder(d as Doc)).filter((o): o is MarketOrder => o !== null);
  });
}
