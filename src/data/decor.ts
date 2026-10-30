/**
 * Bộ trang trí hồ sơ (Avatar, Khung, Nền hồ sơ). Học viên chọn tự do trong số đã sở hữu; chỉ lưu MÃ ở `students/{id}.decor`,
 * server kiểm tra mã nằm trong danh sách này và học viên đã sở hữu (`isDecorOwned`).
 * Ảnh nằm ở public/images/avatar, khung-avatar, avatar-background. Thêm mục mới: thêm ảnh rồi thêm một dòng vào danh sách tương ứng.
 *
 * Bố cục khi hiển thị: nền hồ sơ ở dưới cùng, khung ở trên, avatar nằm TRONG khung (xem `hole` của từng khung).
 * Mặc định: Avatar "Chữ cái đầu", Khung "Không khung", Nền "Mặc định".
 */
export interface AvatarOption {
  id: string;
  label: string;
  /** Đường dẫn ảnh trong public/. null = hiện chữ cái đầu của tên. */
  src: string | null;
}

/** Lỗ tròn bên trong khung, tính theo ảnh khung 300x300 (tâm x, y và bán kính). Avatar được đặt vừa lỗ này, dưới lớp khung. */
export interface FrameHole {
  x: number;
  y: number;
  r: number;
}

export interface FrameOption {
  id: string;
  label: string;
  /** null = không khung. */
  src: string | null;
  hole: FrameHole | null;
}

export interface BackgroundOption {
  id: string;
  label: string;
  /** null = nền mặc định (gradient bằng CSS). */
  src: string | null;
}

const A = "/images/avatar/";
const F = "/images/khung-avatar/";
const B = "/images/avatar-background/";

export const AVATARS: readonly AvatarOption[] = [
  { id: "initial", label: "Chữ cái đầu", src: null },
  { id: "bach-kim-quang-my-nu", label: "Bạch Kim Quang Mỹ Nữ", src: `${A}back-kim-quang-my-nu.png` },
  { id: "mau-don", label: "Mẫu Đơn", src: `${A}mau-don.png` },
  { id: "tuong-quan", label: "Tướng quân", src: `${A}tuong-quan.png` },
  { id: "hiep-khach", label: "Hiệp khách", src: `${A}hiep-khach.png` },
  { id: "phi-tan", label: "Phi Tần", src: `${A}phi-tan.png` },
  { id: "my-nu-ben-hoa-sen", label: "Mỹ nữ bên hoa sen", src: `${A}my-nu-ben-hoa-sen.png` },
  { id: "minh-hong", label: "Minh Hồng", src: `${A}minh-hong.png` },
  { id: "vuong-gia-lang-tu", label: "Vương Gia Lãng Tử", src: `${A}vuong-gia-lang-tu.png` },
  { id: "cuu-vi-ho-ly-tinh", label: "Cửu Vĩ Hồ Ly Tinh", src: `${A}cuu-vi-ho-ly-tinh.png` },
];

/** `hole` đo từ ảnh khung: tâm của vùng trong suốt giữa khung và bán kính của hình tròn cùng diện tích (x0,95). Avatar nằm dưới khung nên mép hơi chồng lên viền khung không sao. */
export const FRAMES: readonly FrameOption[] = [
  { id: "none", label: "Không khung", src: null, hole: null },
  { id: "nghien-muc", label: "Nghiên mực", src: `${F}nghien-muc-khung.png`, hole: { x: 167, y: 142, r: 97 } },
  { id: "trang", label: "Trăng", src: `${F}trang-khung.png`, hole: { x: 158, y: 161, r: 77 } },
  { id: "hoa", label: "Hoa", src: `${F}hoa-khung.png`, hole: { x: 167, y: 145, r: 81 } },
  { id: "phuong-hoang", label: "Phượng hoàng", src: `${F}phuong-hoang-khung.png`, hole: { x: 153, y: 147, r: 71 } },
  { id: "thanh-long", label: "Thanh Long", src: `${F}thanh-long-khung.png`, hole: { x: 154, y: 150, r: 71 } },
  { id: "go", label: "Gỗ", src: `${F}go-khung.png`, hole: { x: 157, y: 142, r: 110 } },
  { id: "giay", label: "Giấy", src: `${F}giay-khung.png`, hole: { x: 153, y: 141, r: 92 } },
  { id: "but-long", label: "Bút lông", src: `${F}but-long-khung.png`, hole: { x: 147, y: 138, r: 97 } },
  { id: "cuu-vi", label: "Cửu vĩ", src: `${F}cuu-vi-khung.png`, hole: { x: 154, y: 140, r: 78 } },
];

export const BACKGROUNDS: readonly BackgroundOption[] = [
  { id: "paper", label: "Mặc định", src: null },
  { id: "ca", label: "Cá", src: `${B}ca-background.jpg` },
  { id: "lau-dai", label: "Lâu đài", src: `${B}lau-dai-background.jpg` },
  { id: "nui", label: "Núi", src: `${B}nui-background.jpg` },
  { id: "trang", label: "Trăng", src: `${B}trang-background.jpg` },
  { id: "hong-nhat", label: "Hồng Nhật", src: `${B}hong-nhat-background.png` },
  { id: "cuu-vi-ho", label: "Cửu vĩ hồ ly", src: `${B}cuu-vi-ho-background.jpg` },
];

export interface Decor {
  avatar: string;
  frame: string;
  background: string;
}

export const DEFAULT_DECOR: Decor = { avatar: "initial", frame: "none", background: "paper" };

export type DecorKind = keyof Decor;

const LISTS: Record<DecorKind, readonly { id: string }[]> = { avatar: AVATARS, frame: FRAMES, background: BACKGROUNDS };

const has = (list: readonly { id: string }[], id: unknown): id is string => typeof id === "string" && list.some((o) => o.id === id);

/**
 * Học viên đã sở hữu mục này chưa? POC: coi như sở hữu hết. Sau này mua ở Phiên chợ thì đọc danh sách đã mua của học viên
 * (ví dụ `students/{id}.ownedDecor`); riêng mục mặc định (chữ cái đầu, không khung, nền mặc định) luôn thuộc về mọi học viên.
 */
export function isDecorOwned(kind: DecorKind, id: string): boolean {
  return has(LISTS[kind], id);
}

/** Đọc `decor` từ dữ liệu bất kỳ; mã lạ/thiếu (kể cả mã kiểu cũ) thì dùng mặc định. */
export function normalizeDecor(raw: unknown): Decor {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    avatar: has(AVATARS, d.avatar) ? d.avatar : DEFAULT_DECOR.avatar,
    frame: has(FRAMES, d.frame) ? d.frame : DEFAULT_DECOR.frame,
    background: has(BACKGROUNDS, d.background) ? d.background : DEFAULT_DECOR.background,
  };
}

/** Chỉ nhận khi CẢ BA mã hợp lệ và học viên đã sở hữu (dùng khi học viên lưu). */
export function parseDecor(avatar: unknown, frame: unknown, background: unknown): Decor | null {
  if (has(AVATARS, avatar) && has(FRAMES, frame) && has(BACKGROUNDS, background)) {
    if (isDecorOwned("avatar", avatar) && isDecorOwned("frame", frame) && isDecorOwned("background", background)) return { avatar, frame, background };
  }
  return null;
}
