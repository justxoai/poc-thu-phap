/**
 * Ảnh của trang Giới thiệu, đang nằm trên Blogger (blogger.googleusercontent.com).
 * Tạm dùng trực tiếp; khi bỏ Blogger, tải ảnh về `public/images/` (hoặc Storage) và đổi đường dẫn ở đây.
 * Kích thước (w, h) là kích thước gốc của ảnh, dùng để giữ đúng tỉ lệ khung ảnh.
 */

export type RemoteImage = { src: string; alt: string; w: number; h: number };

const B = "https://blogger.googleusercontent.com/img";

export const aboutImages = {
  banner: {
    src: `${B}/b/R29vZ2xl/AVvXsEi8V7IOyo1xxMY3J3DSRPKn0-HdHJDXcLz8adndokAKClWTjNOoW3nSlsOVdDEiTR4LIGWdw5is79jX6lc_WW0l78CoN1MCoSPug9jEP4HXzuQE8VSbnkyJcLFnSSuRZzNGPtQUK-OQh85n5g2UesAFaynurhb2PTq3wlAjRFlgwZp93JQ9rqxnSQoG/s1376-rw/gioi%20thieu.png`,
    alt: "Giới thiệu Việt Thư Đạo Quán",
    w: 1376,
    h: 110,
  },
  founder: {
    src: `${B}/b/R29vZ2xl/AVvXsEgHBTzgCM9KXNLq6gNM8pJ0m7gI52KOEIgVNj6GqHkXLP54ccSvY8CdMVYj-E-gjmStpzUNPT3-Vk8tP7Pir0uOBv8yQ8Lk5hwzP280nJMjGp39qc6ofYWvo8C71c4zL-jyy0qxMUTCxkb9x317JBSqRokKebbYuqelHHVlFWXnXWtUJNNoISjSOEYlrJSH/s1600-rw/1788237975023_5923512775892484492_g8542777249897865014_h.jpg`,
    alt: "Bùi Khắc Sáng - Thanh Phong",
    w: 1254,
    h: 1254,
  },
  whyThudao: {
    src: `${B}/b/R29vZ2xl/AVvXsEgwVRICiciM5AEA19OPj2_7UFgLjhRxfGe2HHj8MIhzJ5rkiA2pRrVum2_vX9jJvlcw_5Cc6yNK3H1TwZe9Ntn_JbtEQGsySKsSdwYZhFmxDDNVazKEvYborVfqb5vtEK8RCiwZUy0uBbIyb56TzF7pORzF-B896pyOM9sLR-6fG8dwXdwA_AZSg8YMHwU/s1199-rw/vi%20sao%20thu%20dao.bmp`,
    alt: "Vì sao xây dựng Thudao.com",
    w: 1199,
    h: 387,
  },
  profile: {
    src: `${B}/b/R29vZ2xl/AVvXsEgbj5UeE4hkBbPJIvNJ176JgdWf4cA3dr0looOpVatSnb_QkmfPxxsGGsrKpEgJRlbumMgX-YEV232tSr4eAAvRyaPhsnxuTLEJCM116QIXbwWrnR4X4UQHHJlJBSiS8A5FH-xwjCqvZOvZ2ChKftAPwDoanOrnJJw8A63JTAmbTVOSq42ZHraRL875eZ6T/s1600-rw/New%20Bitmap%20Image.bmp`,
    alt: "Tra cứu kết quả học tập",
    w: 1129,
    h: 841,
  },
  ranking: {
    src: `${B}/a/AVvXsEg3Auiep7l_T9i8fTpFRNhd06d8h8ngHoxscKiLlZbzFq6e0dNHmweLrBHTw-LxjKkl67EWxFU_Xrw9D_UO5Bkm129MfJAe9Nb-7aTPOOvtQCKkLAl2cV39meT57FGeNeqIuFE2oIwsjPPS_ccmgyrs9ae5_-VqbbAymvQhhOEpNiwDiNKFEBlza9XwDOsF=rw`,
    alt: "Bảng xếp hạng học viên",
    w: 463,
    h: 469,
  },
  groups: {
    src: `${B}/a/AVvXsEi6P24zL1H5nvxiELbtLB83wRr03KbqkCfBFZQ2WeWpDLB-LayygUGlPAqXplnXQi8gqnO5HlnAzySTtaQWXT5qIMr7s4DrLUAz0_bp7uL69MugS0pjOWYpsHzR2xV5Dj8J_0lr69295Tzv_1WF5umpQJHrP4sMMziWOVt-1bZ2aSqgH4f9PB-d2LCDDiu9=s1600-rw`,
    alt: "Theo dõi kết quả nhóm học",
    w: 753,
    h: 599,
  },
  lectures: {
    src: `${B}/a/AVvXsEiyFqQGkLxPW9ztK-KEM-XkcBRZLw5zXvzMqBNiYLWXFmu2sLZlQd6tqXK9kGxglsRzOAM8mRyU1fNp_8MgRmom99Y3YQSCaEGhIOaBQ8K_Aw6BqTFNht5xqNvSIJOUEmZSR0F7u6LRCO9AgPcWPIOzuEiwhlb38BtsWEjVL2hXIGCyzYxCj8ra2567Xgy-=s1600-rw`,
    alt: "Video bài giảng thư pháp",
    w: 605,
    h: 523,
  },
  copyLibrary: {
    src: `${B}/a/AVvXsEiUHxeKl91qO3wuTezA5rz6-_nA4lmaoTyH0BiTwBusZgq04UjcJYArX3NZNV4U_A3kP8D7CMX9YRYBnuHkDLlhDYZH9KdptmBAvwqxuKN2GLk1XLfEwC4-PwNEEqI7L0p-aZ_CCZpmcjvyOa6vNgQJe5F89jG6fJPGDFXEzGC_t4GTsqmj3tflhbJ7S1M-=s1600-rw`,
    alt: "Thư viện Lâm Mô Thư Pháp",
    w: 401,
    h: 561,
  },
  endPhoto: {
    src: `${B}/b/R29vZ2xl/AVvXsEgqiRer4qzBhn7cw9Vyv-RBgqHDDqOFYOENp9WmbXESutlnEhkx4KxcztmtvQmXYxxnfXoPqTxe6LmO6AkSf19t7F5MG6kZMdGkenVdwjTlBGM7EqwTbBOQWIYLwioeqnYZRd0iN5qfTu2BnzuvCLJ96SfZ8QyG1SltkqZXhyphenhyphenSkmt3pduKCW03f7IMoI5vh/s320-rw/1788237975023_5923512775892484492_g8542777249897865014_h.jpg`,
    alt: "Thanh Phong",
    w: 320,
    h: 320,
  },
} satisfies Record<string, RemoteImage>;
