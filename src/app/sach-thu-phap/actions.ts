"use server";

import { BOOK } from "@/lib/book-pricing";
import { placeBookOrder } from "@/lib/firestore/purchases";
import { normalizeCode } from "@/lib/firestore/students";
import type { BookDiscount } from "@/lib/types";
import { cleanLine, parseIntInRange, parseVnPhone } from "@/lib/validation";

export type BookOrderField = "name" | "phone" | "quantity" | "address" | "agree";

export type BookOrderState =
  | { status: "idle" }
  | { status: "error"; message: string; fields: Partial<Record<BookOrderField, string>> }
  | {
      status: "ok";
      name: string;
      phone: string;
      quantity: number;
      unitPrice: number;
      total: number;
      discount: BookDiscount;
      duplicate: boolean;
    };

const MSG_UNAVAILABLE = "Hệ thống chưa nhận được đơn. Vui lòng thử lại sau hoặc gọi hotline.";

/**
 * Nhận phiếu đặt sách. Giá và ưu đãi luôn do server tính lại; dữ liệu cá nhân chỉ ghi vào Firestore (không ghi log).
 * Chưa có giới hạn số lần gửi theo IP/CAPTCHA: cần bổ sung ở tầng hạ tầng trước khi mở rộng (AGENTS.md).
 */
export async function submitBookOrderAction(_prev: BookOrderState, formData: FormData): Promise<BookOrderState> {
  // Ô bẫy cho bot: người thật không thấy và không điền.
  if (cleanLine(formData.get("website"), 50) !== "") {
    return { status: "ok", name: "", phone: "", quantity: 1, unitPrice: BOOK.listPrice, total: BOOK.listPrice, discount: "none", duplicate: false };
  }

  const fields: Partial<Record<BookOrderField, string>> = {};
  const name = cleanLine(formData.get("name"), 80);
  if (name.length < 2) fields.name = "Vui lòng nhập họ và tên.";
  const phone = parseVnPhone(formData.get("phone"));
  if (!phone) fields.phone = "Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).";
  const quantity = parseIntInRange(formData.get("quantity"), 1, BOOK.maxQuantity);
  if (!quantity) fields.quantity = `Số lượng từ 1 đến ${BOOK.maxQuantity} cuốn.`;
  const address = cleanLine(formData.get("address"), 300);
  if (address.length < 10) fields.address = "Vui lòng nhập địa chỉ nhận sách đầy đủ (số nhà, đường, phường/xã, tỉnh/thành).";
  if (formData.get("agree") !== "on") fields.agree = "Vui lòng xác nhận thông tin chính xác.";

  const rawPromo = cleanLine(formData.get("promo"), 40);
  const promoCode = rawPromo ? (normalizeCode(rawPromo) ?? "") : "";

  if (!name || !phone || !quantity || Object.keys(fields).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại các ô được đánh dấu.", fields };
  }

  const result = await placeBookOrder({ name, phone, address, quantity, promoCode });
  if (result.status !== "ok") return { status: "error", message: MSG_UNAVAILABLE, fields: {} };

  return { status: "ok", name, phone, quantity, ...result.data };
}
