/**
 * Nội dung Hỏi đáp. Câu hỏi nằm trong `faq.json` (mảng phẳng), mỗi câu có:
 *  - `question`, `answer`: câu hỏi và câu trả lời (cú pháp ngắn của câu trả lời: xem lib/faq-markup.ts);
 *  - `pages`: câu này hiện ở trang nào: "huong-dan" (khối "Khi cần một chút trợ giúp") và/hoặc "hoi-dap";
 *  - `group` (chỉ cần cho trang hoi-dap): nhóm của câu hỏi, một trong `faqGroups`.
 * Thêm/sửa/xóa câu hỏi chỉ cần sửa faq.json, các trang tự cập nhật.
 * Nội dung 25 câu ở trang Hỏi đáp chép từ https://www.thudao.com/p/hoi-dap.html; link tuyệt đối tới trang cũ do lib/links.ts đổi sang đường dẫn mới.
 */
import type { IconName } from "@/components/ui/Icon";

import faqJson from "./faq.json";

export type FaqPage = "huong-dan" | "hoi-dap";
export type FaqGroupId = "dang-ky" | "hoc-tap" | "nop-bai" | "tra-cuu" | "phan-thuong" | "ky-thuat";

export type FaqItem = { question: string; answer: string; pages: FaqPage[]; group?: FaqGroupId };

export type FaqGroup = { id: FaqGroupId; icon: IconName; title: string; note: string };

export const faqItems = faqJson as FaqItem[];

/** Nhóm hiển thị ở trang Hỏi đáp, theo thứ tự. */
export const faqGroups: FaqGroup[] = [
  { id: "dang-ky", icon: "pen", title: "Đăng ký và nhập học", note: "Những điều cần biết trước khi bắt đầu khóa học" },
  { id: "hoc-tap", icon: "graduation", title: "Lịch học và giảng đường", note: "Cách theo dõi lịch và tham gia buổi học" },
  { id: "nop-bai", icon: "brush", title: "Mã học viên và nộp bài", note: "Cách để bài tập được hệ thống ghi nhận chính xác" },
  { id: "tra-cuu", icon: "search", title: "Tra cứu hồ sơ và kết quả", note: "Điểm số, tiến độ, Linh thạch và vật phẩm" },
  { id: "phan-thuong", icon: "gem", title: "Linh thạch, vật phẩm và Chợ phiên", note: "Cơ chế khích lệ quá trình học tập" },
  { id: "ky-thuat", icon: "sliders", title: "Lỗi thường gặp", note: "Một số cách xử lý nhanh trước khi liên hệ hỗ trợ" },
];

/** Các câu hỏi của một trang, giữ nguyên thứ tự trong faq.json. */
export function faqForPage(page: FaqPage): FaqItem[] {
  return faqItems.filter((item) => item.pages.includes(page));
}

/** Câu hỏi trang Hỏi đáp gom theo nhóm; nhóm không có câu nào thì bỏ. */
export function faqGrouped(): { group: FaqGroup; items: FaqItem[] }[] {
  const items = faqForPage("hoi-dap");
  return faqGroups.map((group) => ({ group, items: items.filter((item) => item.group === group.id) })).filter((entry) => entry.items.length > 0);
}

export const faqHero = {
  title: "Một số câu hỏi thường gặp",
  lead: "Tổng hợp những thông tin cơ bản giúp học viên mới làm quen với lớp học, website, cách nộp bài, tra cứu kết quả và hệ thống phần thưởng của Thanh Phong Thư Môn.",
  startTitle: "Người mới nên bắt đầu từ đâu?",
  steps: [
    { title: "Hoàn thành đăng ký", text: "Điền đúng thông tin và số điện thoại để được xác nhận.", icon: "pen" },
    { title: "Vào nhóm của lớp", text: "Theo dõi thông báo và kiểm tra mình được phân vào tổ nào.", icon: "users" },
    { title: "Học và nộp bài", text: "Dùng đúng mã học viên để hệ thống ghi nhận kết quả.", icon: "brush" },
  ] satisfies { title: string; text: string; icon: IconName }[],
};

export const faqFootnote =
  "Nội dung hướng dẫn có thể được điều chỉnh theo từng khóa học. Học viên nên ưu tiên thông báo mới nhất của giáo viên chủ nhiệm.";
