/**
 * Bài viết mẫu lấy từ trang thudao.com hiện tại (các bài vẫn nằm trên Blogger).
 * `href` đang là địa chỉ tuyệt đối của site cũ. Khi chuyển bài viết sang app mới, đổi thành đường dẫn nội bộ.
 */

export type Post = {
  title: string;
  label: "Nhiệm vụ" | "Kiến thức";
  date: string;
  href: string;
  image: string;
  excerpt?: string;
};

export const latestPosts: Post[] = [
  {
    title: "Thông báo một số cập nhật mới trên website Thư Đạo",
    label: "Nhiệm vụ",
    date: "14/10/2026",
    href: "https://www.thudao.com/2026/10/thong-bao-moi.html",
    image: "/images/post-thong-bao-moi.jpg",
    excerpt:
      "Cập nhật mới học viên nên biết trên trang Thư Đạo: tốc độ tải trang, các vật phẩm mới và nhiều thay đổi khác…",
  },
  {
    title: "Tứ Đại Ấn Thạch - Bốn loại đá nổi tiếng được sử dụng để khắc ấn",
    label: "Kiến thức",
    date: "09/10/2026",
    href: "https://www.thudao.com/2026/10/tu-dai-an-tha.html",
    image: "/images/post-tu-dai-an-thach.jpg",
  },
  {
    title: "Thông báo về mini Event mới tháng 10-11 và các thay đổi liên quan",
    label: "Nhiệm vụ",
    date: "08/10/2026",
    href: "https://www.thudao.com/2026/10/thong-bao.html",
    image: "/images/post-mini-event.png",
  },
  {
    title: "Thông báo: Kết quả mini Event “Chiêu mộ tân binh”",
    label: "Nhiệm vụ",
    date: "04/10/2026",
    href: "https://www.thudao.com/2026/10/ket-qua-e.html",
    image: "/images/post-ket-qua-mini-event.png",
  },
  {
    title: "Chọn lựa, khai phong bút lông cho người mới bắt đầu",
    label: "Kiến thức",
    date: "28/09/2026",
    href: "https://www.thudao.com/2026/09/chon-but-lo.html",
    image: "/images/post-chon-but-long.jpg",
  },
];

export const featuredPosts: Pick<Post, "title" | "href" | "image">[] = [
  {
    title: "Thông báo mở nhiệm vụ sự kiện: Chinh phục linh thú",
    href: "https://www.thudao.com/2026/09/chinh-phuc-linh-thu.html",
    image: "/images/feat-chinh-phuc-linh-thu.png",
  },
  {
    title: "Ra mắt hệ thống nhiệm vụ dành cho học viên",
    href: "https://www.thudao.com/2026/09/ra-mat-he-thong-nhiem-vu-danh-cho-hoc.html",
    image: "/images/feat-he-thong-nhiem-vu.png",
  },
  {
    title: "Thông báo về mini Event mới tháng 10-11 và các thay đổi liên quan",
    href: "https://www.thudao.com/2026/10/thong-bao.html",
    image: "/images/feat-mini-event.png",
  },
  {
    title: "Chọn lựa, khai phong bút lông cho người mới bắt đầu",
    href: "https://www.thudao.com/2026/09/chon-but-lo.html",
    image: "/images/feat-chon-but-long.jpg",
  },
];
