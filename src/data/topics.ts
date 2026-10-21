/** Chủ đề (nhãn Blogger) và số bài. Số bài là số liệu tại thời điểm sao chép (19/10/2026), sẽ cũ dần cho tới khi bài viết được chuyển sang app mới. */

export const topics = [
  { name: "Ấn triện", count: 2 },
  { name: "Danh Nhân", count: 11 },
  { name: "Kiến thức", count: 19 },
  { name: "Nhiệm vụ", count: 75 },
  { name: "Reviews", count: 2 },
  { name: "Tài Liệu", count: 9 },
  { name: "Thủy Mặc", count: 3 },
  { name: "Thư pháp Hán", count: 2 },
  { name: "Thư pháp Việt", count: 17 },
  { name: "Thư Phổ", count: 4 },
  { name: "Videos", count: 3 },
] as const;

/** Trang liệt kê bài theo nhãn trên site cũ. */
export function topicHref(name: string): string {
  return `https://www.thudao.com/search/label/${encodeURIComponent(name)}`;
}
