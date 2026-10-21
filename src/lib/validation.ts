/** Kiểm tra dữ liệu người dùng nhập vào form (dùng ở Server Action; không tin dữ liệu từ trình duyệt). */

/** Bỏ ký tự điều khiển, gom khoảng trắng, cắt theo độ dài tối đa. */
export function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Số điện thoại Việt Nam -> dạng 0xxxxxxxxx (10 số), chấp nhận +84/84, dấu cách, chấm, gạch. Không hợp lệ -> null. */
export function parseVnPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+84")) digits = "0" + digits.slice(3);
  else if (/^84\d{9}$/.test(digits)) digits = "0" + digits.slice(2);
  return /^0\d{9}$/.test(digits) ? digits : null;
}

export function isEmail(value: string): boolean {
  return value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Số nguyên trong khoảng [min, max] từ chuỗi; không hợp lệ -> null. */
export function parseIntInRange(raw: unknown, min: number, max: number): number | null {
  if (typeof raw !== "string" || !/^\d{1,3}$/.test(raw.trim())) return null;
  const n = Number(raw);
  return n >= min && n <= max ? n : null;
}
