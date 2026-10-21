import type { DataResult } from "@/lib/types";

/**
 * Bộ nhớ đệm có thời hạn trong tiến trình (mỗi instance máy chủ một bản) cho dữ liệu dùng chung (bảng xếp hạng, danh sách nhiệm vụ...).
 * Giảm số lần đọc Firestore khi nhiều người xem cùng lúc. Chỉ lưu kết quả thành công; lỗi/chưa cấu hình không bị giữ lại.
 * Dữ liệu có thể cũ tối đa `ttlMs`. Không dùng cho dữ liệu cá nhân.
 */
const store = new Map<string, { at: number; value: DataResult<unknown> }>();

export async function cachedResult<T>(key: string, ttlMs: number, load: () => Promise<DataResult<T>>, now = Date.now()): Promise<DataResult<T>> {
  const hit = store.get(key);
  if (hit && now - hit.at < ttlMs) return hit.value as DataResult<T>;
  const value = await load();
  if (value.status === "ok") store.set(key, { at: now, value });
  return value;
}

/** Dùng trong kiểm thử và khi người quản trị vừa cập nhật dữ liệu. */
export function clearCache(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}
