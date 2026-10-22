import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Giá trị cookie phiên học viên: `<mã>.<hết hạn ms>.<HMAC-SHA256>`. Bí mật nằm ở biến môi trường `sessionSecret` (>= 16 ký tự).
 * Không có bí mật => KHÔNG tạo được phiên (trừ khi chạy `next dev`, dùng khóa tạm chỉ để thử). File này không đụng tới cookie
 * để dễ kiểm thử; việc đặt/đọc cookie nằm ở `lib/session.ts`.
 */
export const SESSION_MS = 7 * 24 * 3600 * 1000;
const MIN_SECRET = 16;
const DEV_SECRET = "chi-dung-khi-chay-next-dev-khong-dung-that";

function secret(): string | null {
  const value = process.env.sessionSecret;
  if (typeof value === "string" && value.length >= MIN_SECRET) return value;
  return process.env.NODE_ENV === "development" ? DEV_SECRET : null;
}

export function isSessionConfigured(): boolean {
  return secret() !== null;
}

function sign(key: string, id: string, expires: number): string {
  return createHmac("sha256", key).update(`student-session|${id}|${expires}`).digest("hex");
}

export function createStudentToken(id: string, now = Date.now()): string | null {
  const key = secret();
  if (!key || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return null;
  const expires = now + SESSION_MS;
  return `${id}.${expires}.${sign(key, id, expires)}`;
}

/** Trả mã học viên nếu chữ ký đúng và chưa hết hạn; ngược lại null. */
export function verifyStudentToken(value: string | undefined, now = Date.now()): string | null {
  const key = secret();
  if (!key || !value) return null;
  const m = /^([A-Za-z0-9_-]{1,40})\.(\d{10,14})\.([0-9a-f]{64})$/.exec(value);
  if (!m) return null;
  const expires = Number(m[2]);
  if (expires <= now || expires > now + SESSION_MS + 60_000) return null;
  const expected = Buffer.from(sign(key, m[1], expires), "hex");
  const given = Buffer.from(m[3], "hex");
  return expected.length === given.length && timingSafeEqual(expected, given) ? m[1] : null;
}
