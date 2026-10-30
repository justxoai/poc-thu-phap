// Quét public/images/vat-pham và ghi lại src/data/item-images.ts (danh sách ảnh cho ô chọn ảnh của khu thầy).
// Chạy: npm run items:images   (sau khi thêm/bớt ảnh trong public/images/vat-pham)
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "images", "vat-pham");
const files = readdirSync(dir)
  .filter((f) => /^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|avif)$/.test(f))
  .sort();
const label = (file) => parse(file).name.replace(/[-_]+/g, " ");
const rows = files.map((f) => `  { src: "/images/vat-pham/${f}", label: ${JSON.stringify(label(f))} },`).join("\n");
const body = `/**
 * Ảnh vật phẩm Chợ phiên: các tệp trong public/images/vat-pham. FILE NÀY DO SCRIPT SINH RA (npm run items:images), đừng sửa tay.
 * Tên tệp chỉ gồm chữ thường không dấu, số, "-", "_", "."; đuôi png/jpg/jpeg/webp/avif.
 */
export interface ItemImage {
  src: string;
  label: string;
}

export const ITEM_IMAGES: ItemImage[] = [${rows ? `\n${rows}\n` : ""}];

/** Trả đường dẫn nếu ảnh có trong danh sách, ngược lại null (để chặn đường dẫn bất kỳ gửi lên từ biểu mẫu). */
export function findItemImage(src: string): ItemImage | null {
  return ITEM_IMAGES.find((i) => i.src === src) ?? null;
}
`;
writeFileSync(join(root, "src", "data", "item-images.ts"), body);
console.log(`Đã ghi ${files.length} ảnh vào src/data/item-images.ts`);
