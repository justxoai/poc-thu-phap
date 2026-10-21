import type { BookDiscount } from "@/lib/types";

/** Bảng giá Thư pháp Việt · Quyển I (theo trang cũ). Giá luôn được tính lại ở server, không tin giá từ trình duyệt. */
export const BOOK = {
  title: "Thư pháp Việt · Quyển I",
  listPrice: 380_000,
  earlyPrice: 342_000,
  studentPrice: 304_000,
  maxQuantity: 10,
} as const;

export function bookUnitPrice(discount: BookDiscount): number {
  if (discount === "student") return BOOK.studentPrice;
  if (discount === "early") return BOOK.earlyPrice;
  return BOOK.listPrice;
}

/** Học viên (mã hợp lệ) -20%; nếu không thì -10% khi còn suất đăng ký sớm; hai ưu đãi không cộng dồn. */
export function chooseBookDiscount(isStudent: boolean, earlyBirdLeft: boolean): BookDiscount {
  if (isStudent) return "student";
  return earlyBirdLeft ? "early" : "none";
}

export function bookTotal(discount: BookDiscount, quantity: number): number {
  return bookUnitPrice(discount) * quantity;
}
