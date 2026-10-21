import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { missingAdminEnv } from "./config";

/**
 * Firebase Admin SDK: chỉ dùng ở server (Route Handler, Server Component, Server Action).
 * Admin SDK không bị Firestore Rules áp dụng, nên Rules vẫn có thể chặn toàn bộ client.
 */

export class AdminNotConfiguredError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Thiếu biến môi trường Firebase Admin: ${missing.join(", ")}`);
    this.name = "AdminNotConfiguredError";
  }
}

export function isAdminConfigured(): boolean {
  return missingAdminEnv().length === 0;
}

/** Vercel/.env lưu xuống dòng dưới dạng chuỗi "\n"; chuyển lại thành ký tự xuống dòng thật. */
function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n");
}

let cachedDb: Firestore | null = null;

/** Lấy Firestore. Khởi tạo muộn nên build vẫn chạy được khi chưa có biến môi trường. */
export function getDb(): Firestore {
  if (cachedDb) return cachedDb;

  const missing = missingAdminEnv();
  if (missing.length > 0) throw new AdminNotConfiguredError(missing);

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.projectId as string,
        clientEmail: process.env.clientEmail as string,
        privateKey: normalizePrivateKey(process.env.privateKey as string),
      }),
    });

  cachedDb = getFirestore(app);
  return cachedDb;
}
