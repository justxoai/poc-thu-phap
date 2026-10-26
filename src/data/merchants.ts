import type { IconName } from "@/components/ui/Icon";

/**
 * 9 thương nhân của Phiên chợ. Ảnh nhân vật nằm ở public/images/thuong-nhan/.
 * Vật phẩm và giá dưới đây là BẢN NHÁP để xem giao diện (chưa có ảnh vật phẩm, chưa nối dữ liệu thật):
 * khi có ảnh, thêm trường `image` cho từng vật phẩm và đổi ô giữ chỗ trong MerchantMarket.
 */
export type MerchantItem = { id: string; name: string; price: number; icon: IconName };

export type Merchant = {
  id: string;
  name: string;
  /** Dòng ngắn dưới tên, ở thẻ. */
  shop: string;
  /** Lời chào ở khu giới thiệu. */
  greeting: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  items: MerchantItem[];
};

const img = (file: string) => `/images/thuong-nhan/${file}.png`;

export const MERCHANTS: Merchant[] = [
  {
    id: "thu-gia",
    name: "Thư gia",
    shop: "Văn phòng tứ bảo",
    greeting: "Bút tốt mực hay, chữ mới có hồn. Khách quan cứ tự nhiên xem hàng.",
    image: img("thu-gia"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "tg1", name: "Bút lông sói", price: 120, icon: "brush" },
      { id: "tg2", name: "Mực tùng yên", price: 90, icon: "pen" },
      { id: "tg3", name: "Nghiên đá cổ", price: 260, icon: "gem" },
      { id: "tg4", name: "Giấy xuyến chỉ", price: 60, icon: "file" },
      { id: "tg5", name: "Trấn giấy ngọc", price: 150, icon: "bookmark" },
      { id: "tg6", name: "Ấn chương khắc tên", price: 320, icon: "award" },
    ],
  },
  {
    id: "nu-hoa-gia",
    name: "Nữ họa gia",
    shop: "Tranh và sắc màu",
    greeting: "Mỗi nét vẽ là một lần thở. Ghé xem sắc màu của ta nhé.",
    image: img("nu-hoa-gia"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "nh1", name: "Tranh lụa mini", price: 280, icon: "flower" },
      { id: "nh2", name: "Bảng màu khoáng", price: 180, icon: "sliders" },
      { id: "nh3", name: "Quạt vẽ tay", price: 140, icon: "bird" },
      { id: "nh4", name: "Dấu trang hoa mai", price: 40, icon: "bookmark" },
      { id: "nh5", name: "Thiệp thủ công", price: 55, icon: "heart" },
      { id: "nh6", name: "Cọ vẽ hoa", price: 75, icon: "brush" },
    ],
  },
  {
    id: "hoang-thuong",
    name: "Hoàng thượng",
    shop: "Ban thưởng hoàng gia",
    greeting: "Trẫm hôm nay cao hứng, ai có công ắt có thưởng.",
    image: img("hoang-thuong"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "ht1", name: "Chiếu chỉ ban thưởng", price: 500, icon: "file" },
      { id: "ht2", name: "Ngọc tỉ mini", price: 800, icon: "gem" },
      { id: "ht3", name: "Thẻ bài ngự", price: 450, icon: "award" },
      { id: "ht4", name: "Hộp quà hoàng gia", price: 650, icon: "gift" },
      { id: "ht5", name: "Sắc phong học sĩ", price: 900, icon: "trophy" },
      { id: "ht6", name: "Lệnh miễn bài", price: 380, icon: "shield" },
    ],
  },
  {
    id: "nghe-nhan",
    name: "Nghệ nhân",
    shop: "Đồ thủ công",
    greeting: "Món nào cũng làm bằng tay, từng đường dao đều có chủ ý.",
    image: img("nghe-nhan"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "nn1", name: "Con dấu khắc tay", price: 340, icon: "award" },
      { id: "nn2", name: "Hộp gỗ đựng bút", price: 210, icon: "bag" },
      { id: "nn3", name: "Giá gác bút tre", price: 85, icon: "pen" },
      { id: "nn4", name: "Gối kê cổ tay", price: 70, icon: "heart" },
      { id: "nn5", name: "Thước chặn giấy", price: 95, icon: "bookmark" },
      { id: "nn6", name: "Túi vải thêu", price: 110, icon: "flower" },
    ],
  },
  {
    id: "gian-thuong",
    name: "Gian thương",
    shop: "Buôn bán đủ thứ",
    greeting: "Hàng hiếm đây! Mua nhiều ta bớt cho, nhưng chỉ hôm nay thôi.",
    image: img("gian-thuong"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "gt1", name: "Hộp quà bí ẩn", price: 200, icon: "gift" },
      { id: "gt2", name: "Phiếu giảm giá", price: 50, icon: "file" },
      { id: "gt3", name: "Túi may mắn", price: 160, icon: "bag" },
      { id: "gt4", name: "Bùa hộ mệnh", price: 130, icon: "shield" },
      { id: "gt5", name: "Đồ cũ quý hiếm", price: 420, icon: "gem" },
      { id: "gt6", name: "Bản đồ kho báu", price: 300, icon: "compass" },
    ],
  },
  {
    id: "nong-dan",
    name: "Nông dân",
    shop: "Nông sản đầu mùa",
    greeting: "Lúa mới vừa gặt, chưa kịp phơi. Khách cứ chọn, giá hiền lắm.",
    image: img("nong-dan"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "nd1", name: "Gạo mới", price: 30, icon: "heart" },
      { id: "nd2", name: "Trà xanh sao", price: 65, icon: "flower" },
      { id: "nd3", name: "Mật ong rừng", price: 90, icon: "gift" },
      { id: "nd4", name: "Nón lá", price: 45, icon: "target" },
      { id: "nd5", name: "Giỏ mây", price: 55, icon: "bag" },
      { id: "nd6", name: "Bó lúa trang trí", price: 35, icon: "bird" },
    ],
  },
  {
    id: "vo-tuong",
    name: "Võ tướng",
    shop: "Binh khí và lệnh bài",
    greeting: "Muốn thành danh phải rèn luyện. Chọn món hợp với ý chí của ngươi.",
    image: img("vo-tuong"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "vt1", name: "Kiếm gỗ luyện tập", price: 240, icon: "shield" },
      { id: "vt2", name: "Lệnh bài tướng quân", price: 520, icon: "award" },
      { id: "vt3", name: "Cờ lệnh", price: 150, icon: "target" },
      { id: "vt4", name: "Thẻ khiêu chiến", price: 100, icon: "trophy" },
      { id: "vt5", name: "Đai lưng da", price: 170, icon: "bag" },
      { id: "vt6", name: "Giáp mini", price: 360, icon: "shield" },
    ],
  },
  {
    id: "con-bac",
    name: "Con bạc",
    shop: "Thử vận may",
    greeting: "Thắng thua gì đâu, quan trọng là dám chơi. Lắc thử một ván nhé?",
    image: img("con-bac"),
    imageWidth: 300,
    imageHeight: 300,
    items: [
      { id: "cb1", name: "Xúc xắc may mắn", price: 80, icon: "target" },
      { id: "cb2", name: "Thẻ rút thăm", price: 60, icon: "file" },
      { id: "cb3", name: "Vé cược nhỏ", price: 100, icon: "bookmark" },
      { id: "cb4", name: "Túi tiền đỏ", price: 140, icon: "bag" },
      { id: "cb5", name: "Bài gỗ cổ", price: 190, icon: "gem" },
      { id: "cb6", name: "Đồng xu định mệnh", price: 250, icon: "award" },
    ],
  },
  {
    id: "con-nghien",
    name: "Con nghiện",
    shop: "Của ngon vật lạ",
    greeting: "Suỵt... hàng của ta không phải ai cũng hiểu. Ngồi xuống đây đã.",
    image: img("con-nghien"),
    imageWidth: 300,
    imageHeight: 357,
    items: [
      { id: "cn1", name: "Ấm trà đậm", price: 110, icon: "gift" },
      { id: "cn2", name: "Hương trầm", price: 70, icon: "flower" },
      { id: "cn3", name: "Hộp gỗ bí mật", price: 230, icon: "bag" },
      { id: "cn4", name: "Lọ mực đen", price: 95, icon: "pen" },
      { id: "cn5", name: "Quạt hương", price: 85, icon: "bird" },
      { id: "cn6", name: "Bánh cay đặc chế", price: 45, icon: "heart" },
    ],
  },
];
