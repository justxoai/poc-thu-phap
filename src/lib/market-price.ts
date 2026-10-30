import { findGem, findRarity } from "@/data/gems";

/** Giá sau khuyến mãi (làm tròn, tối thiểu 0). Khuyến mãi là PHẦN TRĂM giảm (1–99). */
export function salePrice(price: number, promo: boolean, percent: number): number {
  if (!promo || !Number.isFinite(percent) || percent <= 0) return price;
  return Math.max(0, Math.round((price * (100 - Math.min(percent, 99))) / 100));
}

/** Tên loại ngọc dùng để định giá theo hạng vật phẩm (mỗi hạng gắn với một loại ngọc). */
export function currencyOfRarity(rarity: string): string {
  const key = findRarity(rarity)?.gem;
  return key ? (findGem(key)?.name ?? "") : "";
}

/** Mã giao dịch của một đơn Chợ phiên: PC-yyMMdd-XXXXX. Suy ra từ ngày (giờ Việt Nam) và 5 ký tự đầu của mã tài liệu, không cần lưu thêm. */
export function orderCode(id: string, createdAtIso: string | null): string {
  const tail = id.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase().padEnd(5, "0");
  if (!createdAtIso) return `PC-000000-${tail}`;
  const d = new Date(createdAtIso);
  if (Number.isNaN(d.getTime())) return `PC-000000-${tail}`;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const pick = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `PC-${pick("year")}${pick("month")}${pick("day")}-${tail}`;
}
