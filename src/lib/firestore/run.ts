import "server-only";

import { getDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { DataResult } from "@/lib/types";
import type { Firestore } from "firebase-admin/firestore";
import { logError } from "@/lib/log-error";

/** Chạy một truy vấn Firestore và đổi mọi kết quả/lỗi thành DataResult, không để lộ chi tiết lỗi ra log hay giao diện. */
export async function runQuery<T>(label: string, fn: (db: Firestore) => Promise<T>): Promise<DataResult<T>> {
  if (!isAdminConfigured()) return { status: "unconfigured" };
  try {
    return { status: "ok", data: await fn(getDb()) };
  } catch (error) {
    logError(`${label}: không đọc được Firestore`, error);
    return { status: "error" };
  }
}

/** Timestamp của Firestore, Date, số (ms) hoặc chuỗi ISO -> chuỗi ISO; không hợp lệ -> null. */
export function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  let date: Date | null = null;
  if (typeof value === "object" && typeof (value as { toDate?: unknown }).toDate === "function") {
    date = (value as { toDate: () => Date }).toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number" || typeof value === "string") {
    date = new Date(value);
  }
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

export function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function toText(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}
