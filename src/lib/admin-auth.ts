import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/**
 * Khóa quản trị cho /admin/dashboard (TẠM THỜI, cách đăng nhập chính thức chưa chốt — xem AGENTS.md).
 * - Khóa nằm ở biến môi trường `adminAccessKey` (>= 12 ký tự). Không có biến => trang quản trị đóng hoàn toàn.
 * - Đăng nhập đúng khóa thì server cấp cookie httpOnly có chữ ký HMAC và hạn dùng; khóa không bao giờ nằm trong cookie.
 */
export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_PATH = "/admin";
export const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const MIN_KEY_LENGTH = 12;

function adminKey(): string | null {
  const key = process.env.adminAccessKey;
  return typeof key === "string" && key.length >= MIN_KEY_LENGTH ? key : null;
}

/**
 * POC-REWIND (3): MỞ trang quản trị mà KHÔNG cần khóa khi chạy `next dev` (localhost) hoặc khi đặt biến môi trường `pocAdminOpen=true`.
 * Trang quản trị chứa SĐT/địa chỉ/email của khách: tuyệt đối không bật `pocAdminOpen` trên bản chạy công khai với dữ liệu thật.
 * Làm thật: xóa hàm này, dùng tài khoản `role=admin`.
 */
export function isPocAdminOpen(): boolean {
  return process.env.pocAdminOpen === "true" || process.env.NODE_ENV === "development";
}

export function isAdminAuthConfigured(): boolean {
  return adminKey() !== null;
}

function sign(key: string, expires: number): string {
  return createHmac("sha256", key).update(`admin-session|${expires}`).digest("hex");
}

/** So sánh hai chuỗi không lộ độ dài hay vị trí khác nhau (so băm SHA-256 bằng timingSafeEqual). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdminKey(input: string): boolean {
  const key = adminKey();
  return key !== null && safeEqual(input, key);
}

export function createSessionValue(now = Date.now()): string | null {
  const key = adminKey();
  if (!key) return null;
  const expires = now + ADMIN_SESSION_MS;
  return `${expires}.${sign(key, expires)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()): boolean {
  const key = adminKey();
  if (!key || !value) return false;
  const match = /^(\d{10,14})\.([0-9a-f]{64})$/.exec(value);
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires <= now || expires > now + ADMIN_SESSION_MS + 60_000) return false;
  return safeEqual(match[2], sign(key, expires));
}

/** Gọi ở đầu mọi trang/hành động quản trị. */
export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(ADMIN_COOKIE)?.value);
}
