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
  },
  socials: [
    { name: "Instagram", href: "https://instagram.com/thuphapthanhphong/" },
    { name: "YouTube", href: "https://www.youtube.com/c/thuphapthanhphong" },
    { name: "Facebook", href: "https://www.facebook.com/thuphapthanhphong" },
    { name: "Twitter", href: "https://twitter.com/vnthudao" },
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

/** 6 lối vào dịch vụ ở trang chủ. */
export const services = [
  { label: "Mua sách", href: "/sach-thu-phap" },
  { label: "Đặt làm ấn", href: "/an-trien" },
  { label: "Khóa học", href: "/dang-ky-hoc" },
  { label: "Giảng đường", href: "/giang-duong" },
  { label: "Tài liệu trả phí", href: "/tai-lieu" },
  { label: "Phòng triển lãm", href: "/trien-lam" },
] as const;

/** 5 lối vào khu "Học online miễn phí". */
export const portalTiles = [
  { label: "Nhiệm vụ", href: "/nhiem-vu", image: "/images/portal-nhiem-vu.jpg" },
  { label: "Bảng xếp hạng", href: "/bang-xep-hang", image: "/images/portal-bang-xep-hang.jpg" },
  { label: "Chợ phiên", href: "/cho-phien", image: "/images/portal-cho-phien.jpg" },
  { label: "Xem lại video", href: "/xem-lai-video", image: "/images/portal-xem-lai-video.jpg" },
  { label: "Mẫu Lâm Mô", href: "/mau-lam-mo", image: "/images/portal-mau-lam-mo.jpg" },
] as const;
