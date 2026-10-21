/**
 * Con trỏ phân trang theo (thời điểm, id): "<mili-giây>.<id>". Dùng cho truy vấn orderBy(thời điểm).orderBy(id) + startAfter.
 * Chỉ nhận đúng định dạng để giá trị từ đường dẫn không thể dùng sai.
 */
const CURSOR = /^(\d{10,14})\.([A-Za-z0-9_-]{1,64})$/;

export function isCursor(value: string | null | undefined): value is string {
  return typeof value === "string" && CURSOR.test(value);
}

export function encodeCursor(iso: string | null, id: string): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) && CURSOR.test(`${ms}.${id}`) ? `${ms}.${id}` : null;
}

export function decodeCursor(value: string | null | undefined): { at: Date; id: string } | null {
  const match = typeof value === "string" ? CURSOR.exec(value) : null;
  return match ? { at: new Date(Number(match[1])), id: match[2] } : null;
}
