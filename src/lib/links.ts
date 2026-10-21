/**
 * Đổi liên kết trang cũ (https://www.thudao.com/p/<tên>.html) sang đường dẫn của app mới
 * khi trang đó đã được dựng. Trang chưa dựng giữ nguyên liên kết cũ.
 * Khi dựng thêm trang nào, thêm một dòng vào ROUTES.
 */
const ROUTES: Record<string, string> = {
  "gioi-thieu": "/gioi-thieu",
  "huong-dan": "/huong-dan",
  "nop-bai": "/nop-bai",
  "tra-cuu": "/tra-cuu/hoc-vien",
  s: "/tra-cuu/can-su-lop",
  "hoi-dap": "/hoi-dap",
  "sach-thu-phap": "/sach-thu-phap",
  "dang-ky-hoc": "/dang-ky-hoc",
  "trien-lam": "/trien-lam",
  "an-trien": "/an-trien",
  "giang-duong": "/giang-duong",
  "tai-lieu": "/tai-lieu",
  quest: "/nhiem-vu",
  "ho-so": "/bang-xep-hang",
  "thu-vien-lam-mo": "/mau-lam-mo",
};

const OLD_PAGE = /^https?:\/\/(?:www\.)?thudao\.com\/p\/([a-z0-9-]+)\.html\/?(?:[?#].*)?$/i;

export function siteLink(href: string): string {
  const match = OLD_PAGE.exec(href);
  if (match) {
    const target = ROUTES[match[1].toLowerCase()];
    if (target) return target;
  }
  return href;
}

export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}
