/** Kiểu dữ liệu dùng chung. Schema Firestore thật cần được xác nhận (xem AGENTS.md mục 5). */

/** Loại tiền/điểm của học viên (3-4 loại). Danh sách cụ thể chưa chốt nên tạm dùng chuỗi. */
export type CurrencyKey = string;

/** Nguồn phát sinh một lần cộng/trừ tiền. Mọi nguồn đều ghi cùng một loại bản ghi `transactions`. */
export type TransactionSource =
  | "study"
  | "quest"
  | "event"
  | "market"
  | "mystery_box"
  | "teacher_gift"
  | "admin_adjust";

/** Kết quả đọc dữ liệu từ Firestore, giúp trang hiển thị đúng trạng thái thay vì lỗi 500. */
export type DataResult<T> = { status: "ok"; data: T } | { status: "unconfigured" } | { status: "error" };

/** Một bài tập đã nộp. Ảnh nằm ở Google Drive (tạm); Firestore chỉ lưu mã tệp Drive. */
export interface WorkItem {
  id: string;
  studentId: string;
  studentName: string;
  /** Tổ, lưu dạng chuỗi ("1".."4") theo dữ liệu gốc. */
  group: string;
  /** Khóa, lưu dạng chuỗi. */
  course: string;
  driveFileId: string;
  description: string;
  score: number | null;
  comment: string;
  /** ISO 8601 (UTC). */
  submittedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

/** Số liệu tổng hợp được cập nhật cùng lúc với mỗi bài nộp/chấm điểm, để tra cứu không phải đọc hết bài nộp. */
export interface StudentStats {
  submissionCount: number;
  gradedCount: number;
  scoreSum: number;
  /** ISO 8601 hoặc null nếu chưa có bài hợp lệ. */
  lastSubmittedAt: string | null;
}

/** Hồ sơ trả cho trình duyệt. Tuyệt đối không chứa số điện thoại, email, địa chỉ, ngày sinh. */
export interface StudentPublicProfile {
  id: string;
  name: string;
  /** Trang trí hồ sơ (mã Avatar/Khung/Nền, xem data/decor.ts). */
  decor: { avatar: string; frame: string; background: string };
  group: string;
  course: string;
  wallet: Record<CurrencyKey, number>;
  inventory: InventoryItem[];
  stats: StudentStats;
}

export type ActivityLevel = "active" | "warning" | "danger";

export interface ActivityStatus {
  level: ActivityLevel;
  text: string;
  detail: string;
}

export interface GroupMemberRow {
  id: string;
  name: string;
  average: number;
  submissionCount: number;
  activity: ActivityStatus;
}

/** Giao dịch tiền thật (khác `orders` của Chợ phiên, vốn trừ Linh thạch): mua sách, đăng ký khóa học, mua tài liệu. */
export type PurchaseKind = "book" | "course" | "document" | "seal";

export type BookDiscount = "student" | "early" | "none";

/** Trạng thái xử lý do người phụ trách cập nhật. "new" là mới nhận. */
export type PurchaseStatus = "new" | "confirmed" | "paid" | "shipped" | "done" | "cancelled";

/** Bản ghi `purchases/{id}`. Chứa dữ liệu cá nhân (điện thoại, địa chỉ, email): CHỈ đọc ở trang quản trị. */
export interface PurchaseRecord {
  id: string;
  kind: PurchaseKind;
  name: string;
  phone: string;
  email: string;
  address: string;
  zalo: string;
  /** Tên sản phẩm/gói đã chọn. */
  item: string;
  quantity: number;
  /** Mã ưu đãi (mã học viên) người mua đã nhập, nếu có. */
  promoCode: string;
  discount: BookDiscount | "";
  unitPrice: number;
  total: number;
  /** Ghi chú của khách (đơn đặt ấn). */
  note: string;
  status: string;
  /** ISO 8601 hoặc null nếu thiếu. */
  createdAt: string | null;
}

export interface MarketItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number;
  active: boolean;
  /** Dùng cho biểu mẫu sửa của khu thầy. */
  description: string;
  rarity: string;
  imageId: string;
}

/** Bản ghi `orders/{id}`: một lượt đổi quà ở Chợ phiên (đã trừ Linh thạch). */
export interface MarketOrder {
  id: string;
  studentId: string;
  studentName: string;
  itemName: string;
  quantity: number;
  cost: number;
  currency: string;
  status: string;
  createdAt: string | null;
}
