/** Chữ thường, bỏ dấu tiếng Việt, gom khoảng trắng: dùng để tìm kiếm và so khớp không phân biệt dấu. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}
