import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin dùng module native/động, để Next không bundle nó.
  serverExternalPackages: ["firebase-admin"],
  poweredByHeader: false,
  // /tra-cuu là mục cha của menu "Tra cứu"; trang cũ /p/tra-cuu.html là hồ sơ học viên.
  async redirects() {
    return [
      { source: "/tra-cuu", destination: "/tra-cuu/hoc-vien", permanent: false },
      // Trang quản trị chuyển từ /dashboard sang /admin/dashboard (Đợt 3).
      { source: "/dashboard", destination: "/admin/dashboard", permanent: false },
      // Địa chỉ trang cũ trên Blogger -> trang mới (giữ liên kết cũ không gãy).
      { source: "/p/an-trien.html", destination: "/an-trien", permanent: true },
      { source: "/p/giang-duong.html", destination: "/giang-duong", permanent: true },
      { source: "/p/tai-lieu.html", destination: "/tai-lieu", permanent: true },
      { source: "/p/quest.html", destination: "/nhiem-vu", permanent: true },
      { source: "/p/ho-so.html", destination: "/bang-xep-hang", permanent: true },
      { source: "/p/thu-vien-lam-mo.html", destination: "/mau-lam-mo", permanent: true },
      // Bài viết: /2026/10/thong-bao-moi.html -> /2026/10/thong-bao-moi
      { source: "/:year(\\d{4})/:month(\\d{2})/:slug.html", destination: "/:year/:month/:slug", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Tạm: ảnh trang Giới thiệu còn nằm trên Blogger (xem LESSONS_LEARNED L-017).
    remotePatterns: [
      { protocol: "https", hostname: "blogger.googleusercontent.com", pathname: "/img/**" },
    ],
  },
};

export default nextConfig;
