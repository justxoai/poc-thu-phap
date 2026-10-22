import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Băm mật khẩu bằng scrypt (có sẵn trong Node, không cần thư viện). Định dạng lưu:
 *   scrypt$N$r$p$<salt base64>$<hash base64>
 * Muốn tăng độ khó sau này chỉ cần đổi N: mật khẩu cũ vẫn kiểm tra được vì tham số nằm trong chuỗi, `needsRehash` báo khi nào nên băm lại.
 * Không bao giờ lưu, ghi log hay trả mật khẩu thô.
 */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const MAXMEM = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LEN, { N: n, r, p, maxmem: MAXMEM }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  if (![n, r, p].every((v) => Number.isInteger(v) && v > 0) || n > 1 << 20) return false;
  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  if (salt.length === 0 || expected.length !== KEY_LEN) return false;
  try {
    const actual = await derive(password, salt, n, r, p);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`scrypt$${N}$${R}$${P}$`);
}

let dummy: Promise<string> | null = null;
/** Băm giả để việc "không tìm thấy tài khoản" tốn thời gian gần bằng "sai mật khẩu" (khó dò tài khoản qua thời gian phản hồi). */
export function burnPasswordCheck(password: string): Promise<boolean> {
  dummy ??= hashPassword("khong-phai-mat-khau-that");
  return dummy.then((hash) => verifyPassword(password, hash)).then(() => false);
}
