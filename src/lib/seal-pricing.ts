/**
 * Bảng giá và kiểm tra phiếu đặt ấn (hàm thuần, dùng cả ở trình duyệt để tạm tính và ở server để tính lại).
 * Giá đơn vị chỉ lấy từ bảng này; riêng "Đá đẹp" (1.500.000–2.000.000đ) và "Đá cực đẹp" (từ 2.000.000đ) cho nhập mức giá trong khoảng cho phép.
 */

export const SEAL_DESIGN_FEE = 300_000;
export const SEAL_MAX_ITEMS = 10;
export const SEAL_MAX_QUANTITY = 20;
export const SEAL_MAX_CONTENT = 120;
export const SEAL_MAX_EXTRA = 300;
/** Trần giá cho đá cực đẹp, tránh nhập nhầm thừa số 0. */
export const SEAL_CUSTOM_MAX = 50_000_000;

export const SEAL_TYPES = [
  { id: "danh", name: "Danh chương", hint: "Khắc tên, tên tự hoặc biệt hiệu" },
  { id: "nhan", name: "Nhàn chương", hint: "Địa danh, năm can chi, câu mở đầu" },
] as const;

export const SEAL_SIZES = [
  { id: "s1", name: "0,8 - 1,5 cm" },
  { id: "s2", name: "1,5 - 2 cm" },
  { id: "s3", name: "2 - 3 cm" },
  { id: "s4", name: "Trên 3 cm" },
] as const;

export interface SealStone {
  id: "thuong" | "tot" | "dep" | "cucdep";
  name: string;
  hint: string;
  /** Giá cố định, hoặc khoảng cho phép khi `min` ≠ `max`. */
  min: number;
  max: number;
  priceLabel: string;
}

export const SEAL_STONES: SealStone[] = [
  { id: "thuong", name: "Đá thường", hint: "Đá phổ thông, giá mềm", min: 900_000, max: 900_000, priceLabel: "900.000đ" },
  { id: "tot", name: "Đá tốt", hint: "Ít sa đinh, không nứt, không ổ trùng", min: 1_200_000, max: 1_200_000, priceLabel: "1.200.000đ" },
  { id: "dep", name: "Đá đẹp", hint: "Thấu quang nhẹ, không nứt, không sa đinh, không ổ trùng", min: 1_500_000, max: 2_000_000, priceLabel: "1.500.000đ – 2.000.000đ" },
  { id: "cucdep", name: "Đá cực đẹp", hint: "Đá tuyển chọn, vân màu đặc biệt", min: 2_000_000, max: SEAL_CUSTOM_MAX, priceLabel: "Từ 2.000.000đ" },
];

export interface SealItemInput {
  type: string;
  size: string;
  stone: string;
  /** Đơn giá một con ấn; bỏ qua với đá giá cố định. */
  unitPrice?: number;
  quantity: number;
  content: string;
  extra: string;
  design: boolean;
}

export interface SealItem {
  type: string;
  size: string;
  stone: string;
  unitPrice: number;
  quantity: number;
  content: string;
  extra: string;
  design: boolean;
  /** unitPrice × quantity + phí thiết kế (nếu có). */
  total: number;
}

export function stoneById(id: string): SealStone | null {
  return SEAL_STONES.find((s) => s.id === id) ?? null;
}

export function sealItemTotal(unitPrice: number, quantity: number, design: boolean): number {
  return unitPrice * quantity + (design ? SEAL_DESIGN_FEE : 0);
}

/** Đơn giá mặc định khi chọn loại đá. */
export function defaultUnitPrice(stoneId: string): number {
  return stoneById(stoneId)?.min ?? 0;
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export type SealItemsResult = { ok: true; items: SealItem[]; total: number } | { ok: false; message: string };

/** Kiểm tra danh sách ấn do trình duyệt gửi lên (JSON). Mọi giá trị đều được kiểm tra lại với bảng giá. */
export function validateSealItems(raw: unknown): SealItemsResult {
  let list: unknown = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      return { ok: false, message: "Danh sách ấn không hợp lệ. Vui lòng tải lại trang và thử lại." };
    }
  }
  if (!Array.isArray(list) || list.length === 0) return { ok: false, message: "Vui lòng thêm ít nhất một con ấn." };
  if (list.length > SEAL_MAX_ITEMS) return { ok: false, message: `Mỗi đơn tối đa ${SEAL_MAX_ITEMS} con ấn.` };

  const items: SealItem[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const row = list[i];
    const label = `Ấn số ${i + 1}`;
    if (!row || typeof row !== "object") return { ok: false, message: `${label}: dữ liệu không hợp lệ.` };
    const r = row as Record<string, unknown>;
    const type = SEAL_TYPES.find((t) => t.id === r.type);
    if (!type) return { ok: false, message: `${label}: vui lòng chọn loại ấn.` };
    const size = SEAL_SIZES.find((s) => s.id === r.size);
    if (!size) return { ok: false, message: `${label}: vui lòng chọn kích thước.` };
    const stone = stoneById(typeof r.stone === "string" ? r.stone : "");
    if (!stone) return { ok: false, message: `${label}: vui lòng chọn loại đá.` };
    const quantity = typeof r.quantity === "number" && Number.isInteger(r.quantity) ? r.quantity : 0;
    if (quantity < 1 || quantity > SEAL_MAX_QUANTITY) return { ok: false, message: `${label}: số lượng từ 1 đến ${SEAL_MAX_QUANTITY}.` };

    let unitPrice = stone.min;
    if (stone.min !== stone.max) {
      const given = typeof r.unitPrice === "number" && Number.isInteger(r.unitPrice) ? r.unitPrice : 0;
      if (given < stone.min || given > stone.max) {
        return { ok: false, message: `${label}: giá ${stone.name.toLowerCase()} phải từ ${stone.min.toLocaleString("vi-VN")}đ đến ${stone.max.toLocaleString("vi-VN")}đ.` };
      }
      unitPrice = given;
    }
    const content = cleanText(r.content, SEAL_MAX_CONTENT);
    const design = r.design === true;
    // Không nhờ thiết kế thì phải có nội dung khắc.
    if (!design && content.length < 1) return { ok: false, message: `${label}: vui lòng nhập nội dung muốn khắc hoặc tích "Nhờ GVCN thiết kế".` };

    items.push({
      type: type.id,
      size: size.id,
      stone: stone.id,
      unitPrice,
      quantity,
      content,
      extra: cleanText(r.extra, SEAL_MAX_EXTRA),
      design,
      total: sealItemTotal(unitPrice, quantity, design),
    });
  }
  return { ok: true, items, total: items.reduce((sum, it) => sum + it.total, 0) };
}

/** Mô tả ngắn một đơn để hiển thị ở trang quản trị. */
export function sealSummary(items: SealItem[]): string {
  return items
    .map((it, i) => {
      const type = SEAL_TYPES.find((t) => t.id === it.type)?.name ?? it.type;
      const size = SEAL_SIZES.find((s) => s.id === it.size)?.name ?? it.size;
      const stone = stoneById(it.stone)?.name ?? it.stone;
      return `${i + 1}. ${type} · ${size} · ${stone} × ${it.quantity}${it.content ? ` — “${it.content}”` : ""}${it.design ? " (nhờ thiết kế)" : ""}`;
    })
    .join("\n");
}
