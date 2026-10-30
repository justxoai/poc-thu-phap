/**
 * Ảnh vật phẩm Chợ phiên: các tệp trong public/images/vat-pham. FILE NÀY DO SCRIPT SINH RA (npm run items:images), đừng sửa tay.
 * Tên tệp chỉ gồm chữ thường không dấu, số, "-", "_", "."; đuôi png/jpg/jpeg/webp/avif.
 */
export interface ItemImage {
  src: string;
  label: string;
}

export const ITEM_IMAGES: ItemImage[] = [];

/** Trả đường dẫn nếu ảnh có trong danh sách, ngược lại null (để chặn đường dẫn bất kỳ gửi lên từ biểu mẫu). */
export function findItemImage(src: string): ItemImage | null {
  return ITEM_IMAGES.find((i) => i.src === src) ?? null;
}
