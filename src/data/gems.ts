/**
 * Các loại ngọc và cấp bậc (suy ra từ student-reward-core.min.js của site cũ).
 * Quy đổi theo Hồng Ngọc: 1 Hồng = 3 Lục Thạch = 6 Lam Bảo Thạch = 9 Thạch Anh Tím = 12 Hải Lam Ngọc = 15 Hoàng Ngọc.
 * "Tài sản" (phú hào) tính bằng Hoàng Ngọc = giá trị Hồng × 15.
 */
import { normalizeText } from "@/lib/text";

export interface GemType {
  key: string;
  name: string;
  /** Số viên loại này bằng 1 Hồng Ngọc. */
  perHong: number;
}

export const GEMS: GemType[] = [
  { key: "hoangNgoc", name: "Hoàng Ngọc", perHong: 15 },
  { key: "haiLamNgoc", name: "Hải Lam Ngọc", perHong: 12 },
  { key: "thachAnhTim", name: "Thạch Anh Tím", perHong: 9 },
  { key: "lamBaoThach", name: "Lam Bảo Thạch", perHong: 6 },
  { key: "lucThach", name: "Lục Thạch", perHong: 3 },
  { key: "hongNgoc", name: "Hồng Ngọc", perHong: 1 },
];

/** Độ hiếm của vật phẩm ở Chợ phiên, mỗi bậc gắn với một loại ngọc (giá đổi tính theo Hồng Ngọc). */
export const RARITIES = [
  { key: "phoThong", name: "Phổ thông", gem: "hoangNgoc" },
  { key: "trungPham", name: "Trung phẩm", gem: "haiLamNgoc" },
  { key: "trungThuongPham", name: "Trung thượng phẩm", gem: "thachAnhTim" },
  { key: "thuongPham", name: "Thượng phẩm", gem: "lamBaoThach" },
  { key: "caoCap", name: "Cao cấp", gem: "lucThach" },
  { key: "cucPham", name: "Cực phẩm", gem: "hongNgoc" },
] as const;

export type RarityKey = (typeof RARITIES)[number]["key"];

export function findRarity(value: string): (typeof RARITIES)[number] | null {
  const needle = normalizeText(value);
  if (!needle) return null;
  return RARITIES.find((r) => normalizeText(r.key) === needle || normalizeText(r.name) === needle) ?? null;
}

export function findGem(value: string): GemType | null {
  const needle = normalizeText(value);
  if (!needle) return null;
  return GEMS.find((g) => normalizeText(g.key) === needle || normalizeText(g.name) === needle) ?? null;
}

/** Tài sản quy ra Hoàng Ngọc từ ví { tên hoặc mã ngọc: số lượng }. Khóa không phải ngọc (ví dụ "Linh thạch" chung) bị bỏ qua. */
export function wealthInHoangNgoc(wallet: Record<string, number>): number {
  let hong = 0;
  for (const [label, quantity] of Object.entries(wallet)) {
    const gem = findGem(label);
    if (gem && Number.isFinite(quantity) && quantity > 0) hong += quantity / gem.perHong;
  }
  return Math.round(hong * 15 * 100) / 100;
}

/** 10 cấp bậc theo Rank (điểm kinh nghiệm). */
export const LEVELS = [
  { min: 0, name: "Tân thủ nhập môn" },
  { min: 100, name: "Cầm bút chắc chắn" },
  { min: 300, name: "Biết cách lấy mực" },
  { min: 700, name: "Lộ phong đều đặn" },
  { min: 1500, name: "Trung phong sắc nét" },
  { min: 3000, name: "Nhãn lực nâng cao" },
  { min: 5000, name: "Chương pháp ổn định" },
  { min: 8000, name: "Cao thủ" },
  { min: 12000, name: "Thoát tục tự nhiên" },
  { min: 20000, name: "Thư gia tố chất" },
] as const;

export function levelFor(rank: number): string {
  let name: string = LEVELS[0].name;
  for (const level of LEVELS) if (rank >= level.min) name = level.name;
  return name;
}
