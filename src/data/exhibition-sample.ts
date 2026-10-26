import type { ExhibitionMeta, ExhibitionWork } from "@/lib/firestore/exhibition";

/**
 * Tác phẩm MẪU để xem trước giao diện trang Triển lãm (dùng chung một ảnh mẫu). Tên học viên là tên giả.
 * Trang chỉ dùng bộ này khi Firestore chưa có tác phẩm nào (chưa kết nối hoặc chưa có bài `featured`).
 * Muốn tắt hẳn: đặt SHOW_SAMPLE_WHEN_EMPTY = false.
 */
export const SHOW_SAMPLE_WHEN_EMPTY = true;

/** Ảnh mẫu dùng chung cho mọi thẻ mẫu (public/images). */
const SAMPLE_IMAGE = "/images/anh-nhap-trien-lam.webp";

const NAMES = ["Nguyễn Hoàng Yến", "Trần Minh Anh", "Lê Thu Hà", "Phạm Quốc Bảo", "Đặng Thanh Thảo", "Vũ Hải Đăng", "Bùi Ngọc Lan", "Hoàng Gia Huy", "Đỗ Mai Phương", "Ngô Tuấn Kiệt", "Dương Khánh Linh", "Lý Bảo Châu", "Phan Việt Anh", "Trịnh Diệu Hương", "Mai Thanh Tùng", "Cao Thúy Vy", "Tạ Minh Khôi", "Hà Phương Thảo", "Lương Đức Minh", "Đinh Bích Ngọc", "Võ Thiên Ân", "Huỳnh Mỹ Linh", "Châu Gia Bảo", "Kim Anh Thư"];
const AVATARS = ["initial", "brush", "pen", "bird", "flower", "temple", "book", "gem", "compass"];
const FRAMES = ["none", "gold", "jade", "ink", "double", "vermilion"];
const TOPICS = ["Chữ Tâm", "Chữ An", "Chữ Nhẫn", "Chữ Đức", "Chữ Phúc", "Chữ Hiếu", "Chữ Trí", "Chữ Lộc", "Chữ Thọ", "Chữ Tín", "Chữ Duyên", "Chữ Thiện"];

/** 37 tác phẩm, tổ 1-4, khóa 1-3, rải trong ~5 tháng; sinh bằng công thức cố định nên mỗi lần dựng đều giống nhau. */
export const SAMPLE_WORKS: ExhibitionWork[] = Array.from({ length: 37 }, (_, i) => {
  const day = Date.UTC(2026, 4, 12, 3, 0, 0) + i * 4 * 24 * 3600_000 + (i % 5) * 3600_000;
  return {
    id: `mau${String(i + 1).padStart(2, "0")}`,
    studentName: NAMES[i % NAMES.length],
    group: String((i % 4) + 1),
    course: String(((i * 7) % 3) + 1),
    driveFileId: "",
    imageSrc: SAMPLE_IMAGE,
    description: `${TOPICS[i % TOPICS.length]} · Bài tuần ${(i % 10) + 1}`,
    submittedAt: new Date(day).toISOString(),
    decor: { avatar: AVATARS[i % AVATARS.length], frame: FRAMES[(i * 5) % FRAMES.length], background: "paper" },
  };
});

export function sampleMeta(): ExhibitionMeta {
  const sortLabels = (v: string[]) => [...new Set(v)].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
  return {
    works: SAMPLE_WORKS.length,
    students: new Set(SAMPLE_WORKS.map((w) => w.studentName)).size,
    groups: sortLabels(SAMPLE_WORKS.map((w) => w.group)),
    courses: sortLabels(SAMPLE_WORKS.map((w) => w.course)),
  };
}
