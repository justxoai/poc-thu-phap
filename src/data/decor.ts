import type { IconName } from "@/components/ui/Icon";

/**
 * Bộ trang trí hồ sơ có sẵn (Avatar, Khung, Nền). Học viên chọn tự do; chỉ lưu MÃ ở `students/{id}.decor`,
 * server kiểm tra mã nằm trong danh sách này. Hiển thị bằng CSS (`.dc-*` trong components/student/decor.css), không dùng ảnh.
 * Muốn khóa theo Rank hoặc bán ở Chợ phiên: thêm `minRank`/`price` vào đây rồi kiểm tra ở `saveDecorAction`.
 */
export interface AvatarOption {
  id: string;
  label: string;
  /** null = hiện chữ cái đầu của tên. */
  icon: IconName | null;
}

export interface StyleOption {
  id: string;
  label: string;
}

export const AVATARS: readonly AvatarOption[] = [
  { id: "initial", label: "Chữ cái đầu", icon: null },
  { id: "brush", label: "Bút lông", icon: "brush" },
  { id: "pen", label: "Bút", icon: "pen" },
  { id: "bird", label: "Chim", icon: "bird" },
  { id: "flower", label: "Hoa", icon: "flower" },
  { id: "temple", label: "Đình", icon: "temple" },
  { id: "book", label: "Sách", icon: "book" },
  { id: "gem", label: "Ngọc", icon: "gem" },
  { id: "compass", label: "La bàn", icon: "compass" },
];

export const FRAMES: readonly StyleOption[] = [
  { id: "none", label: "Không khung" },
  { id: "gold", label: "Vàng" },
  { id: "jade", label: "Xanh ngọc" },
  { id: "ink", label: "Mực đen" },
  { id: "double", label: "Viền kép" },
  { id: "vermilion", label: "Chu sa" },
];

export const BACKGROUNDS: readonly StyleOption[] = [
  { id: "paper", label: "Giấy" },
  { id: "mist", label: "Sương" },
  { id: "bamboo", label: "Trúc" },
  { id: "dusk", label: "Hoàng hôn" },
  { id: "stone", label: "Đá" },
];

export interface Decor {
  avatar: string;
  frame: string;
  background: string;
}

export const DEFAULT_DECOR: Decor = { avatar: "initial", frame: "none", background: "paper" };

const has = (list: readonly { id: string }[], id: unknown): id is string => typeof id === "string" && list.some((o) => o.id === id);

/** Đọc `decor` từ dữ liệu bất kỳ; mã lạ/thiếu thì dùng mặc định. */
export function normalizeDecor(raw: unknown): Decor {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    avatar: has(AVATARS, d.avatar) ? d.avatar : DEFAULT_DECOR.avatar,
    frame: has(FRAMES, d.frame) ? d.frame : DEFAULT_DECOR.frame,
    background: has(BACKGROUNDS, d.background) ? d.background : DEFAULT_DECOR.background,
  };
}

/** Chỉ nhận khi CẢ BA mã hợp lệ (dùng khi học viên lưu). */
export function parseDecor(avatar: unknown, frame: unknown, background: unknown): Decor | null {
  if (has(AVATARS, avatar) && has(FRAMES, frame) && has(BACKGROUNDS, background)) return { avatar, frame, background };
  return null;
}
