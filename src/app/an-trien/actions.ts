"use server";

import { placeSealOrder } from "@/lib/firestore/purchases";
import { validateSealItems } from "@/lib/seal-pricing";
import { cleanLine, isEmail, parseVnPhone } from "@/lib/validation";

export type SealOrderField = "name" | "phone" | "address" | "email" | "items" | "agree";

export type SealOrderState =
  | { status: "idle" }
  | { status: "error"; message: string; fields: Partial<Record<SealOrderField, string>> }
  | { status: "ok"; name: string; phone: string; count: number; total: number; duplicate: boolean };

const MSG_UNAVAILABLE = "Hệ thống chưa nhận được đơn. Vui lòng thử lại sau hoặc liên hệ GVCN.";

/**
 * Nhận phiếu đặt ấn. Danh sách ấn và giá do server kiểm tra lại hoàn toàn với bảng giá; dữ liệu cá nhân chỉ ghi vào Firestore.
 * Chưa có giới hạn số lần gửi theo IP/CAPTCHA (xem AGENTS.md).
 */
export async function submitSealOrderAction(_prev: SealOrderState, formData: FormData): Promise<SealOrderState> {
  if (cleanLine(formData.get("website"), 50) !== "") return { status: "ok", name: "", phone: "", count: 0, total: 0, duplicate: false };

  const fields: Partial<Record<SealOrderField, string>> = {};
  const name = cleanLine(formData.get("name"), 80);
  if (name.length < 2) fields.name = "Vui lòng nhập họ và tên.";
  const phone = parseVnPhone(formData.get("phone"));
  if (!phone) fields.phone = "Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).";
  const address = cleanLine(formData.get("address"), 300);
  if (address.length < 10) fields.address = "Vui lòng nhập địa chỉ nhận ấn đầy đủ (số nhà, đường, phường/xã, tỉnh/thành).";
  const email = cleanLine(formData.get("email"), 120);
  if (email && !isEmail(email)) fields.email = "Email chưa đúng định dạng.";
  if (formData.get("agree") !== "on") fields.agree = "Vui lòng xác nhận thông tin chính xác.";

  const validated = validateSealItems(formData.get("items"));
  if (!validated.ok) fields.items = validated.message;

  if (!phone || !validated.ok || Object.keys(fields).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại các ô được đánh dấu.", fields };
  }

  const note = cleanLine(formData.get("note"), 500);
  const result = await placeSealOrder({ name, phone, address, email, note, items: validated.items, total: validated.total });
  if (result.status !== "ok") return { status: "error", message: MSG_UNAVAILABLE, fields: {} };
  return { status: "ok", name, phone, count: validated.items.length, total: validated.total, duplicate: result.data.duplicate };
}
