/**
 * Nội dung trang Mua sách (chép từ https://www.thudao.com/p/sach-thu-phap.html, đọc ngày 19/10/2026).
 * Ảnh nằm ở Google Drive (tạm, xem AGENTS.md); chỉ lưu mã tệp.
 */

export const bookImages = {
  cover: { id: "15IFQMi7NqDVll6gtyfdZ-ENBaBTAtUy-", alt: "Thư pháp Việt · Quyển I", width: 2000 },
  journey: { id: "1Uk5eAquuTpUmdXhHOzgNS4INhS6KFisj", alt: "Thư pháp Việt · Quyển I", width: 1500 },
  tools: { id: "1f9wAmcv7VkI6AaCFI5dqFFU--tiq5Mdz", alt: "Bút, mực, giấy và nghiên", width: 1600 },
  preview: { id: "1mAw8UNlaITTwe4q9o1qiF8KDdT0Ziy18", alt: "Một trang trong Quyển I", width: 1600 },
  companionA: { id: "14tyCUAlCRjDn8Oq6174adxL5s58m0U3U", alt: "Thư pháp Việt", width: 1600 },
  companionB: { id: "1SJwjGfd-QtzvCidbTCb59xLKOZoTvb1J", alt: "Thư pháp Việt", width: 1600 },
  order: { id: "14KVlzo9pR98_cm-ymiEq0m6KFY1i2S1W", alt: "Thư pháp Việt · Quyển I", width: 1600 },
  reviews: [
    "1CIQUv3WqhOBbCK5A261UChhSSteLIyrN",
    "1XQ8jwJrWn5yS9Dc-Fcy4aN09meoCi32y",
    "1VXhs4YfmKdrwuGSs2seFYWcRSYjmDyjU",
    "1EFDaNgO1x4K_bITsB9CV3i6lN7Bl4pVq",
    "1LffEjjYlyZISHK7dHe0XrnkZ1dXjqfWv",
  ],
} as const;

export const bookHero = {
  mark: "Quyển I",
  titleLines: ["Thư pháp Việt", "Dành cho người mới bắt đầu"],
  lead: "Gần mười năm nghiên cứu, thực hành và giảng dạy thư pháp, được sắp xếp lại thành một lộ trình dành cho người cầm bút lần đầu — từ nền tảng cổ điển cho tới cách vận dụng vào chữ Quốc ngữ.",
  primary: "Đăng ký mua sách",
  secondary: "Khám phá Quyển I",
};

export const bookStudentOffer = {
  tag: "Dành riêng cho học viên",
  title: "Học viên lớp thư pháp Online giảm 20%",
  text: "Học viên khóa D4 nhập Mã học viên của mình ở ô mã ưu đãi khi đặt sách, giá sẽ được trừ ngay khi gửi phiếu đăng ký. Học viên các khóa trước cũng được giảm 20% khi nhập Mã học viên. Áp dụng cho mọi số lượng trong cùng một đơn.",
  chip: "Mã HV",
  chipHint: "Nhập Mã học viên ở ô mã ưu đãi",
  badge: "HV −20%",
};

export const bookPrices = {
  no: "01",
  label: "Giá sách",
  eyebrow: "Giá bán",
  title: "Ba mức giá, tùy vào bạn đến từ đâu",
  tiers: [
    { name: "Giá bìa", price: 380_000, was: null, note: "Giá bán chính thức của Quyển I, áp dụng cho mọi đơn hàng lẻ." },
    { name: "Đăng ký sớm", price: 342_000, was: 380_000, note: "Giảm 10% cho 50 khách hàng đăng ký sớm nhất. Hết suất là dừng." },
    {
      name: "Học viên các khóa",
      price: 304_000,
      was: 380_000,
      note: "Giảm 20% khi nhập Mã học viên (khóa D4 và các khóa trước) ở phiếu đăng ký. Không cộng dồn với ưu đãi đăng ký sớm.",
    },
  ],
};

export const bookJourney = {
  no: "02",
  label: "Hành trình",
  eyebrow: "Một hành trình với con chữ",
  title: "Gần mười năm nghiên cứu trong một cuốn sách",
  paragraphs: [
    "Cuốn sách này lớn lên từ nhiều năm học, luyện và dạy thư pháp. Những nguyên tắc của lối viết truyền thống được soi lại, chọn lọc, rồi vận dụng vào chữ Quốc ngữ — thứ chữ mà người Việt hôm nay đang viết hằng ngày.",
    "Sách không bắt đầu bằng câu hỏi làm sao cho chữ đẹp. Sách bắt đầu từ những câu hỏi nền: thư pháp là gì, người viết đang làm gì với cây bút, và vì sao một nét lại được đặt xuống như thế.",
    "Toàn bộ kiến thức được sắp thành một lộ trình có thứ tự, để người mới không phải tự gom nhặt từ những nguồn rời rạc.",
  ],
  pull: "Một người bạn đồng hành, giúp bạn đặt những nét đầu tiên xuống một nền vững.",
  caption: "Thư pháp Việt · Quyển I",
};

export const bookFoundation = {
  no: "03",
  label: "Nền tảng",
  eyebrow: "Hiểu trước khi viết",
  title: "Cuốn sách không chỉ dạy cách viết một nét chữ",
  lead: "Sách giúp người học hiểu vì sao mình viết từng nét: khái niệm trước, thẩm mỹ sau, kỹ thuật theo sau cùng — theo đúng thứ tự đó.",
  points: [
    {
      title: "Học cái cũ để hiểu con đường mới",
      text: ["Người học được khuyến khích tìm hiểu thư pháp chữ Hán. Không phải để viết chữ Hán, mà để chạm vào hệ thẩm mỹ cổ điển đã được bồi đắp qua nhiều thế kỷ, và để rút ngắn quãng đường tự mò mẫm."],
    },
    {
      title: "Kế thừa nhưng không áp dụng máy móc",
      text: [
        "Hai lối viết dùng hai hệ chữ khác nhau. Có điều chuyển sang được, có điều thì không.",
        "Giữ hay bỏ một nguyên tắc phụ thuộc vào ba thứ: chỗ giống nhau, chỗ khác nhau, và kết quả thực tế khi đặt bút lên chữ Quốc ngữ.",
      ],
    },
    {
      title: "Hiểu đúng ngôn ngữ của người viết chữ",
      text: [
        "Một số thuật ngữ được trả về tiếng Việt thường ngày: ngang, dọc, chấm.",
        "Một số khái niệm cô đọng thì giữ nguyên và giải thích kỹ — Bút lực, Bút pháp, Lộ phong, Tàng phong, Viên bút — vì chưa có từ thay thế nào gọn và đúng hơn.",
      ],
    },
    {
      title: "Thư pháp không chỉ là viết chữ cho đẹp",
      text: [
        "Nét chữ còn là cách người viết bày tỏ ý nghĩ của mình.",
        "Vì vậy việc học gồm cả quan sát hình thái, tìm hiểu người xem phản ứng ra sao trước một con chữ, rồi quay lại mài giũa kỹ thuật.",
      ],
    },
    {
      title: "Trước khi viết đẹp, hãy viết chân thật",
      text: [
        "Nét đã đi rồi thì không tô lại cho đẹp hơn.",
        "Sửa đi sửa lại sẽ biến việc viết thành việc vẽ, và che mất trình độ thật của người cầm bút — thứ duy nhất cho biết nên luyện tiếp điều gì.",
      ],
    },
  ],
  closing: [
    "Một cuốn sách dành cho người mới, nhưng không dừng ở những điều đơn giản.",
    "Sách đi qua công cụ, cách cầm bút, cách vận bút, hệ khái niệm, hình thái con chữ, bố cục trang viết, và cách tự đánh giá một tác phẩm — dựng nền trước, phong cách riêng để sau.",
  ],
};

export const bookRoadmap = {
  no: "04",
  label: "Lộ trình",
  eyebrow: "Nội dung Quyển I",
  title: "Bắt đầu từ công cụ. Tiến tới một tác phẩm.",
  lead: "Bốn chặng nối tiếp nhau: công cụ, vật liệu, kỹ thuật dụng bút, rồi nguyên lý tổ chức con chữ thành một trang viết hoàn chỉnh.",
  stages: [
    { no: "01", title: "Bút · Mực", text: "Nhận biết công cụ, đặc tính từng loại bút, và những yếu tố chi phối đường đi của ngọn bút." },
    { no: "02", title: "Giấy · Nghiên", text: "Vật liệu và cách giấy, mực, bút tác động lẫn nhau trước khi bạn đặt nét đầu tiên." },
    { no: "03", title: "Dụng bút", text: "Cách vận bút, cách một nét được hình thành, và những khái niệm kỹ thuật căn bản." },
    { no: "04", title: "Chương pháp", text: "Từ một con chữ đến trục, khoảng cách và bố cục của cả một tác phẩm." },
  ],
};

export const bookContents = {
  no: "05",
  label: "Mục lục",
  eyebrow: "Mục lục Quyển I",
  title: "Kiến thức được sắp xếp thành một lộ trình",
  lead: "Đi lần lượt từ trên xuống, người mới không cần tự gom nhặt từ những nguồn rời rạc.",
  items: [
    "Thư pháp là gì? Thư pháp Việt là gì?",
    "Mối liên hệ giữa thư pháp truyền thống và Thư pháp Việt.",
    "Tìm hiểu và lựa chọn bút, mực, giấy và nghiên.",
    "Hệ thống những khái niệm căn bản trong thư pháp.",
    "Những kỹ thuật nền tảng về dụng bút và đường nét.",
    "Quan sát hình thái, khoảng cách, trục và sự cân bằng của con chữ.",
    "Nguyên lý bố cục và chương pháp.",
    "Cách quan sát, đánh giá và tiếp tục phát triển khả năng thực hành.",
  ],
};

export const bookPreview = {
  no: "06",
  label: "Xem trước",
  eyebrow: "Xem trước nội dung",
  title: "Một trang trong sách",
  lead: "Kiến thức, hướng dẫn và hình minh họa được trình bày cạnh nhau trên cùng một trang.",
};

export const bookCompanion = {
  no: "07",
  label: "Đồng hành",
  eyebrow: "Thư pháp Việt · Quyển I",
  title: "Một người bạn đồng hành cùng những tâm hồn yêu chữ",
  closing: "Sách được làm ra để ở cạnh bạn suốt những buổi luyện đầu tiên.",
};

export const bookForeword = {
  no: "08",
  label: "Lời tựa",
  eyebrow: "Lời tựa",
  title: "Trước khi bắt đầu hành trình với con chữ",
  paragraphs: [
    "Những trang sách này được tổng hợp từ nhiều nguồn tư liệu, từ điều học được ở bè bạn đồng môn, và từ kinh nghiệm nghiên cứu của chính người viết.",
    "Công việc này chưa khép lại. Mong bạn đọc cùng quan sát, cùng ngẫm, rồi tự dựng lấy cảm thức về cái đẹp của riêng mình.",
  ],
  signature: "Thư pháp Việt",
};

export const bookReviews = {
  no: "09",
  label: "Phản hồi",
  eyebrow: "Chia sẻ của khách hàng",
  title: "Những phản hồi về cuốn sách",
  hint: "Kéo ngang để xem thêm",
};

export const bookOrder = {
  no: "10",
  label: "Đặt sách",
  eyebrow: "Đăng ký mua sách",
  title: "Bắt đầu hành trình với Thư pháp Việt",
  hotlines: ["0395 021 559", "0966 966 007"],
  formTitle: "Phiếu đăng ký mua sách",
  formLead: "Điền thông tin bên dưới rồi gửi phiếu. Chúng tôi sẽ liên hệ qua số điện thoại để xác nhận đơn và cách thanh toán.",
  promoHint: "Học viên khóa D4 và các khóa trước nhập Mã học viên của mình để được giảm 20%.",
  consent: "Tôi xác nhận thông tin trên là chính xác và đăng ký mua Thư pháp Việt · Quyển I.",
  submit: "Gửi đăng ký mua sách",
  success: {
    title: "Đăng ký thành công",
    text: "Cảm ơn bạn đã đăng ký Thư pháp Việt · Quyển I. Thông tin của bạn đã được gửi đi.",
    note: "Bạn không cần gửi lại biểu mẫu. Cần đổi thông tin nhận sách, vui lòng gọi 0395 021 559 hoặc 0966 966 007.",
  },
};

export const bookFooter = {
  title: "Thư pháp Việt",
  tagline: "Giữ gìn nét chữ, gửi gắm tâm tình.",
};
