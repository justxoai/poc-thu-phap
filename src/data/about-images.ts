/**
 * Ảnh của trang Giới thiệu. Phần lớn là file riêng trong `public/images/` (kích thước gốc ghi ở w, h để giữ đúng tỉ lệ khung ảnh).
 * Ảnh kết (endPhoto) còn nằm trên Blogger (blogger.googleusercontent.com); khi bỏ Blogger thì tải về `public/images/` và đổi đường dẫn.
 */

export type RemoteImage = { src: string; alt: string; w: number; h: number };

const B = "https://blogger.googleusercontent.com/img";

export const aboutImages = {
  banner: { src: "/images/gioi-thieu-slogan.webp", alt: "Giới thiệu Việt Thư Đạo Quán", w: 1376, h: 110 },
  founder: { src: "/images/ho-so-tac-gia.webp", alt: "Bùi Khắc Sáng - Thanh Phong", w: 1254, h: 1254 },
  profile: { src: "/images/tra-cuu-ket-qua-va-qua-trinh.webp", alt: "Tra cứu kết quả học tập", w: 1129, h: 841 },
  ranking: { src: "/images/bang-xep-hang.webp", alt: "Bảng xếp hạng học viên", w: 463, h: 469 },
  groups: { src: "/images/theo-doi-ket-qua.webp", alt: "Theo dõi kết quả nhóm học", w: 753, h: 599 },
  lectures: { src: "/images/xem-lai-bai-giang.webp", alt: "Video bài giảng thư pháp", w: 605, h: 523 },
  copyLibrary: { src: "/images/thu-vien-mo-lam-phap.webp", alt: "Thư viện Lâm Mô Thư Pháp", w: 401, h: 561 },
  endPhoto: {
    src: `${B}/b/R29vZ2xl/AVvXsEgqiRer4qzBhn7cw9Vyv-RBgqHDDqOFYOENp9WmbXESutlnEhkx4KxcztmtvQmXYxxnfXoPqTxe6LmO6AkSf19t7F5MG6kZMdGkenVdwjTlBGM7EqwTbBOQWIYLwioeqnYZRd0iN5qfTu2BnzuvCLJ96SfZ8QyG1SltkqZXhyphenhyphenSkmt3pduKCW03f7IMoI5vh/s320-rw/1788237975023_5923512775892484492_g8542777249897865014_h.jpg`,
    alt: "Thanh Phong",
    w: 320,
    h: 320,
  },
} satisfies Record<string, RemoteImage>;
