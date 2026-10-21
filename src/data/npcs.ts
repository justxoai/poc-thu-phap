/** Nhân vật trong trang Nhiệm vụ (chép từ https://www.thudao.com/p/quest.html, đọc ngày 22/10/2026). Ảnh ở Google Drive (tạm). */

export interface Npc {
  id: string;
  name: string;
  imageId: string;
  line: string;
}

export const npcs: Npc[] = [
  { id: "hoang-thuong", name: "Hoàng Thượng", imageId: "1Finz6QiLulYVNZFi6pDIC1WWlvrsiUrW", line: "Có đứa định soán ngôi đoạt vị nên ta bắt buộc phải bán bớt đồ trong cung, lấy linh thạch về để nuôi dưỡng thế lực, giữ vững vị thế cửu ngũ chí tôn" },
  { id: "nu-hoa-gia", name: "Nữ hoạ gia", imageId: "1L4V5qve_wnahsOxbgmq3roG1F273pF1P", line: "Cầm kỳ thư hoạ cái gì ta cũng giỏi, ta có thể giúp người làm mấy việc, giao dịch với ta nhé" },
  { id: "nong-dan", name: "Nông dân", imageId: "1i6ySB2vY9Vriv0plpCyYfNfH3hQLN54k", line: "Giá này là rẻ rồi! Mua đi bạn ơi! Mua ủng hộ ta đi mà!" },
  { id: "nghe-nhan", name: "Nghệ nhân", imageId: "1HmqFzW5CaKZbx-SUwc2atY1RNsj8yPYB", line: "Nghệ thuật không quan trọng bằng tiền bạc, có tiền mới sướng, đổi cho ta mấy viên linh thạch đó đi!" },
  { id: "thu-gia", name: "Thư gia", imageId: "15dkuOLGo13HUkMAItyNf6PK0lriZfCFr", line: "Nghe danh thầy Thanh Phong chưa? Nếu nghe rồi thì đây là mấy món ta để rẻ cho ngươi!" },
  { id: "vo-tuong", name: "Võ tướng", imageId: "1Pg7vDri9WnDE2_t-bB4KrYWiXmmArPAZ", line: "Ta đánh đông dẹp bắc có may mắn sở hữu vài món đồ hay ho! Ta để rẻ cho ngươi đó!" },
  { id: "con-bac", name: "Con bạc", imageId: "1sdJOfX09vm69yzjOR3FPQgjWM3Y9yeog", line: "Đang thua lỗ quá nên đang rất cần số linh thạch đó để trả nợ, hãy giúp ta gỡ lại ít vốn đi mà" },
  { id: "con-nghien", name: "Con nghiện", imageId: "1jINvUEHIBc301IAih-29jp-8BATVCoUr", line: "Ta đang thiếu vài món linh thạch để đi làm việc lớn, ta để rẻ mấy món hàng này cho ngươi đó" },
  { id: "gian-thuong", name: "Gian thương", imageId: "174Y6g4mOD7ai_JItag6cs2lbT_q_h_JR", line: "Hàng ở chỗ ta là tuyệt đối chuẩn giá và chất lượng cực tốt, hãy ghé vào lựa nhanh nhé" },
];

export const questHero = {
  kicker: "OCD QUEST",
  title: "Trang Nhiệm Vụ",
  lead: "Gặp gỡ các nhân vật trong Thanh Phong Thư Môn, khám phá website và hoàn thành các nhiệm vụ do Trợ giảng Minh Hồng giao cho bạn.",
  welcomeTitle: "Chào mừng bạn đến Thanh Phong Thư Môn",
  welcomeText: "Hãy xác minh mã học viên với Minh Hồng để bắt đầu nhiệm vụ.",
};

export const beastSchedule = "Sự kiện Chinh phục Linh Thú từ 19:00–20:00 hằng ngày";
