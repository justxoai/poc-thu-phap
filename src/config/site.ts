import type { IconName } from "@/components/ui/Icon";

/** Cấu hình dùng chung toàn site: thông tin liên hệ, menu, lối vào. Sửa ở đây, không sửa rải rác trong component. */

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const site = {
  name: "Thanh Phong Thư Môn",
  description:
    "Trang chính thức chia sẻ thông tin của Việt Thư Đạo Quán nói chung, lớp thư pháp Online của Thanh Phong Thư Môn nói riêng.",
  about: "Đây là website tổng hợp kiến thức chữ nghĩa và các bài viết hướng dẫn thực hành thư pháp",
  contact: {
    phone: "0395 021 559",
    phoneTel: "+84395021559",
    email: "vnthudao@gmail.com",
    address: "Kim Mã, Giảng Võ, Hà Nội",
    /** Liên kết mở Google Maps (bấm ở thanh trên cùng và Footer). */
    mapUrl: "https://maps.app.goo.gl/UhS8oaaFNxybzaFH9",
    /** Địa chỉ nhúng bản đồ (iframe ở Footer). */
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5518.21513215444!2d105.8164006!3d21.0299707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab00779b8d25%3A0x45090d3f1da34dce!2zTOG7m3AgaOG7jWMgdmnhur90IHRoxrAgcGjDoXAgVmnhu4d0IHThuqFpIEjDoCBO4buZaSAtIFRoYW5oIFBob25n!5e1!3m2!1svi!2s!4v1792685078688!5m2!1svi!2s",
  },
  socials: [
    { name: "Instagram", icon: "instagram" as IconName, href: "https://instagram.com/thuphapthanhphong/" },
    { name: "YouTube", icon: "youtube" as IconName, href: "https://www.youtube.com/c/thuphapthanhphong" },
    { name: "Facebook", icon: "facebook" as IconName, href: "https://www.facebook.com/thuphapthanhphong" },
    { name: "Twitter", icon: "twitter" as IconName, href: "https://twitter.com/vnthudao" },
  ],
} as const;

export const mainNav: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Hướng dẫn", href: "/huong-dan" },
  { label: "Nộp bài tập", href: "/nop-bai" },
  {
    label: "Tra cứu",
    href: "/tra-cuu",
    children: [
      { label: "Học viên", href: "/tra-cuu/hoc-vien" },
      { label: "Cán sự lớp", href: "/tra-cuu/can-su-lop" },
    ],
  },
  { label: "Hỏi đáp nhanh", href: "/hoi-dap" },
];

/** 6 lối vào dịch vụ ở trang chủ. `image`: tranh mực (PNG nền trong suốt, 250x250) đặt trong `public/images`. */
export const services = [
  { label: "Mua sách", href: "/sach-thu-phap", image: "/images/mua-sach-background.png" },
  { label: "Đặt làm ấn", href: "/an-trien", image: "/images/dat-lam-an.png" },
  { label: "Khóa học", href: "/dang-ky-hoc", image: "/images/khoa-hoc.png" },
  { label: "Giảng đường", href: "/giang-duong", image: "/images/giang-duong.png" },
  { label: "Tài liệu trả phí", href: "/tai-lieu", image: "/images/tai-lieu-tra-phi.png" },
  { label: "Phòng triển lãm", href: "/trien-lam", image: "/images/phong-trien-lam.png" },
] as const;

/** 5 lối vào khu "Học online miễn phí". */
export const portalTiles = [
  { label: "Nhiệm vụ", href: "/nhiem-vu", image: "/images/portal-nhiem-vu.jpg" },
  { label: "Bảng xếp hạng", href: "/bang-xep-hang", image: "/images/portal-bang-xep-hang.jpg" },
  { label: "Chợ phiên", href: "/cho-phien", image: "/images/portal-cho-phien.jpg" },
  { label: "Xem lại video", href: "/xem-lai-video", image: "/images/portal-xem-lai-video.jpg" },
  { label: "Mẫu Lâm Mô", href: "/mau-lam-mo", image: "/images/portal-mau-lam-mo.jpg" },
] as const;
