import { BOOK } from "@/lib/book-pricing";
import { courses, packagesOf } from "@/data/courses";
import { SEAL_STONES } from "@/lib/seal-pricing";

/**
 * Danh mục bán của khu thầy: `catalog/{id}` = { kind, name, description, price (đồng), active, createdAt, updatedAt }.
 * CHỈ để thầy quản lý/nhìn danh sách; các trang bán công khai (Mua sách, Đặt ấn, Đăng ký học, Tài liệu) vẫn dùng bảng giá trong code
 * và Server Action vẫn tính giá từ code, KHÔNG đọc danh mục này.
 */
export const CATALOG_KINDS = ["book", "seal", "course", "document"] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const CATALOG_TAB: Record<string, CatalogKind> = { "mua-sach": "book", "dat-an": "seal", "khoa-hoc": "course", "tai-lieu": "document" };

export const CATALOG_TEXT: Record<CatalogKind, { sale: string; add: string; noun: string; empty: string; buyers: string; buyersEmpty: string }> = {
  book: { sale: "Danh sách sách bán", add: "Thêm sách", noun: "sách", empty: "Chưa có sách nào trong danh mục.", buyers: "Người mua sách", buyersEmpty: "Chưa có đơn mua sách." },
  seal: { sale: "Danh sách ấn bán", add: "Thêm loại ấn", noun: "loại ấn", empty: "Chưa có loại ấn nào trong danh mục.", buyers: "Người đặt ấn", buyersEmpty: "Chưa có đơn đặt ấn." },
  course: { sale: "Danh sách khóa học bán", add: "Thêm khóa học", noun: "khóa học", empty: "Chưa có khóa học nào trong danh mục.", buyers: "Người đăng ký khóa học", buyersEmpty: "Chưa có đăng ký khóa học." },
  document: { sale: "Danh sách tài liệu bán", add: "Thêm tài liệu", noun: "tài liệu", empty: "Chưa có tài liệu nào trong danh mục.", buyers: "Người mua tài liệu", buyersEmpty: "Chưa có đơn mua tài liệu." },
};

export interface CatalogSeed {
  id: string;
  kind: CatalogKind;
  name: string;
  description: string;
  price: number;
}

/** Các mục có sẵn trong code (sách, ấn, khóa × gói) để nạp vào danh mục. Mã cố định nên nạp nhiều lần không tạo trùng. Tài liệu nạp từ collection `documents`. */
export function builtinCatalog(kind: CatalogKind): CatalogSeed[] {
  if (kind === "book") return [{ id: "book-quyen-1", kind, name: BOOK.title, description: "Giá bìa; đăng ký sớm và học viên được giảm riêng.", price: BOOK.listPrice }];
  if (kind === "seal") return SEAL_STONES.map((s) => ({ id: `seal-${s.id}`, kind, name: s.name, description: s.hint, price: s.min }));
  if (kind === "course") return courses.flatMap((c) => packagesOf(c).map((p) => ({ id: `course-${c.id}-${p.id}`.toLowerCase(), kind, name: `${c.name} · ${p.name}`, description: c.meta.slice(0, 2).join(" · "), price: p.price })));
  return [];
}

/** Mã tài liệu trong danh mục khi nạp từ `documents/{docId}`. */
export const documentCatalogId = (docId: string): string => `document-${docId}`.slice(0, 80);
