/**
 * Nội dung trang Hướng dẫn (sao chép từ https://www.thudao.com/p/huong-dan.html, đối chiếu ngày 19/10/2026).
 *
 * Chuỗi văn bản dùng ký hiệu rút gọn: **chữ đậm** và [nhãn](đường dẫn).
 * Đường dẫn trỏ trang cũ (https://www.thudao.com/p/...) được đổi sang đường dẫn mới nếu trang đó đã dựng (xem src/lib/links.ts).
 *
 * Ảnh: 8 ảnh đang hotlink Blogger; ảnh mục 05 là ảnh nhúng sẵn trên trang cũ, đã lưu thành file trong public/images.
 * Video: danh sách YouTube chốt tại thời điểm sao chép. Trang cũ nạp danh sách này từ một Google Sheet khi mở trang;
 * bản mới dùng dữ liệu tĩnh (sửa ở đây hoặc chuyển sang Firestore sau).
 */

import type { IconName } from "@/components/ui/Icon";

import guideFaq from "./guide-faq.json";

const B = "https://blogger.googleusercontent.com/img/b/R29vZ2xl";

export type GuideFaqItem = { question: string; answer: string };

export type GuideImage = { src: string; alt: string; w: number; h: number; narrow?: boolean };

export type GuideSection = {
  id: string;
  no: string;
  title: string;
  sub: string;
  steps: { title: string; text: string }[];
  note: string;
  cta: { label: string; href: string };
  image: GuideImage;
  video: { title: string; youtubeId: string };
};

export const guideHero = {
  eyebrow: "Thanh Phong Thư Môn · Cẩm nang học viên",
  titleLines: ["Một vòng Thư Đạo.", "Mở lối vào hành trình học."],
  lead: "Từ buổi học đầu tiên đến những tác phẩm được trưng bày: thudao.com kết nối việc học, luyện tập, nộp bài và theo dõi tiến bộ trong cùng một không gian.",
};

export const guideIntro = {
  title: "Bạn muốn làm gì hôm nay?",
  text: "Thư Đạo có cả những trang đọc tự do và những chức năng dành cho học viên đã được nhận diện. Bạn có thể đọc kiến thức, xem triển lãm và tìm hiểu khóa học trước; khi có mã học viên, hãy xác minh với Minh Hồng để sử dụng đúng hồ sơ của mình.",
  mapTitle: "Bản đồ các khu vực chính",
  allLabel: "Xem tất cả khu vực",
};

const P = "https://www.thudao.com/p/";

/** Sáu việc người học hay làm nhất, hiện thành sáu ô lớn ngay dưới câu hỏi "Bạn muốn làm gì hôm nay?". */
export const guideGoals: { icon: IconName; title: string; text: string; cta: string; href: string }[] = [
  { icon: "user", title: "Tôi mới, muốn đăng ký", text: "Xem chương trình, đăng ký và nhận mã học viên.", cta: "Đăng ký học", href: `${P}dang-ky-hoc.html` },
  { icon: "graduation", title: "Vào lớp học", text: "Xem lịch, chọn đúng phòng và vào buổi học trực tuyến.", cta: "Mở Giảng đường", href: `${P}giang-duong.html` },
  { icon: "pen", title: "Nộp bài tập", text: "Gửi bài luyện tập bằng mã học viên và mã bài.", cta: "Nộp bài", href: `${P}nop-bai.html` },
  { icon: "trophy", title: "Xem điểm và thứ hạng", text: "Theo dõi vị trí của bạn trên bảng thứ hạng.", cta: "Xem bảng thứ hạng", href: `${P}ho-so.html` },
  { icon: "brush", title: "Xem triển lãm", text: "Ngắm các tác phẩm của học viên và thầy trò Thư Đạo.", cta: "Vào phòng triển lãm", href: `${P}trien-lam.html` },
  { icon: "message", title: "Cần hỗ trợ", text: "Tìm câu trả lời nhanh cho những thắc mắc thường gặp.", cta: "Hỏi đáp nhanh", href: `${P}hoi-dap.html` },
];

export const guideMap: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Bắt đầu & đồng hành",
    links: [
      { label: "Giới thiệu Thư Đạo", href: `${P}gioi-thieu.html` },
      { label: "Đăng ký học Online", href: `${P}dang-ky-hoc.html` },
      { label: "Tra cứu mã học viên D4", href: `${P}tra-cuu-ma-hoc-vien.html` },
      { label: "Tổ học viên", href: `${P}gioi-thieu-to.html` },
      { label: "Hỏi đáp nhanh", href: `${P}hoi-dap.html` },
      { label: "Môn quy", href: `${P}mon-quy.html` },
    ],
  },
  {
    title: "Học & luyện tập",
    links: [
      { label: "Giảng đường", href: `${P}giang-duong.html` },
      { label: "Phòng Luyện Công", href: `${P}luyen-cong.html` },
      { label: "Nhiệm vụ OCD Quest", href: `${P}quest.html` },
      { label: "Thư viện lâm mô", href: `${P}thu-vien-lam-mo.html` },
      { label: "Kho tài liệu & video", href: `${P}tai-lieu.html` },
    ],
  },
  {
    title: "Bài tập & thành tích",
    links: [
      { label: "Nộp bài tập", href: `${P}nop-bai.html` },
      { label: "Hồ sơ & Chợ phiên", href: `${P}tra-cuu.html` },
      { label: "Bảng thứ hạng", href: `${P}ho-so.html` },
      { label: "Phòng triển lãm", href: `${P}trien-lam.html` },
      { label: "Phòng thi tốt nghiệp", href: `${P}ocd-phong-thi-tot-nghiep-graduation.html` },
      { label: "Kết quả tốt nghiệp", href: `${P}ket-qua-thi-tot-nghiep.html` },
    ],
  },
  {
    title: "Đọc thêm & dịch vụ",
    links: [
      { label: "Bài viết & thông báo", href: "https://www.thudao.com/search?max-results=12" },
      { label: "Khái niệm cơ bản", href: `${P}khai-niem.html` },
      { label: "Thư phổ", href: `${P}thu-pho.html` },
      { label: "Sách thư pháp", href: `${P}sach-thu-phap.html` },
      { label: "Đặt làm ấn", href: `${P}an-trien.html` },
      { label: "Khóa học trực tiếp", href: `${P}khoa-hoc.html` },
    ],
  },
];

export const guideSections: GuideSection[] = [
  {
    id: "td-bat-dau",
    no: "01",
    title: "Bắt đầu cùng Minh Hồng",
    sub: "Một mã học viên, nhiều không gian học tập.",
    steps: [
      {
        title: "Nếu bạn là người mới",
        text: "Mở trang Đăng ký học, đọc chương trình và làm theo hướng dẫn đăng ký. Vào nhóm lớp chính thức, chờ xác nhận và phân tổ. Việc gửi form đăng ký chưa thay cho xác nhận nhập học.",
      },
      {
        title: "Lưu đúng mã học viên",
        text: `Khi được cấp mã, hãy lưu lại để dùng khi học, nộp bài và tra cứu. Học viên D4 có thể dùng [trang tra cứu mã học viên](${P}tra-cuu-ma-hoc-vien.html) bằng số điện thoại hoặc email đã đăng ký. Nếu chưa tìm thấy, liên hệ người phụ trách lớp.`,
      },
      {
        title: "Mở trợ giảng ở góc màn hình",
        text: "Bấm avatar Minh Hồng ở góc dưới bên phải. Chọn **Tôi đã có mã học viên**, nhập mã của mình rồi bấm **TRA CỨU MÃ HỌC VIÊN**. Chờ hệ thống nhận diện thành công.",
      },
      {
        title: "Kiểm tra trước khi tiếp tục",
        text: "Dùng đúng mã đã được cấp, không dùng mã của người khác. Khi đổi thiết bị, trình duyệt hoặc mở cửa sổ riêng tư, bạn có thể cần xác minh lại.",
      },
    ],
    note: "Mã học viên và mã bài tập là hai thông tin khác nhau: mã học viên xác định người học; mã bài tập, chẳng hạn T1, xác định nội dung cần nộp.",
    cta: { label: "Đăng ký học", href: `${P}dang-ky-hoc.html` },
    image: {
      src: `${B}/AVvXsEimgLuD5ai-0_05ANMjaqCzXCRyHqV992rqExi6UWvOBHb8P4re5Bcmlj-Wkr5-pcIYsWaqRqOTgU_g2ewQEc3HMYvKrHoghzumVvkioEwtwvF-ceAbsCVPvRLjzl31ZlM_Z7hE3UH0Nfu4s8fAV0SklHmVrtCPEECBnVxKAobu4esckDovWCqcimLlJlmA/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: ô nhập mã và nút tra cứu trong cửa sổ Minh Hồng.",
      w: 390,
      h: 475,
      narrow: true,
    },
    video: { title: "Bắt đầu cùng Minh Hồng", youtubeId: "frCLD_iX6R8" },
  },
  {
    id: "td-giang-duong",
    no: "02",
    title: "Vào Giảng đường",
    sub: "Học trực tiếp, vào đúng phòng của mình.",
    steps: [
      {
        title: "Xem lịch và phòng được phân",
        text: "Từ trang chủ bấm **GIẢNG ĐƯỜNG**. Đọc thông báo mới nhất của lớp và chọn phòng Hoà Bình hoặc Hạnh Phúc theo phân công.",
      },
      {
        title: "Kiểm tra mã ngay tại phòng",
        text: "Nhập mã học viên vào ô **Kiểm tra Mã học viên** của phòng tương ứng rồi bấm **KIỂM TRA**. Chờ kết quả xác minh quyền vào lớp.",
      },
      {
        title: "Vào lớp khi phòng mở",
        text: "Khi đúng lịch và đủ điều kiện, dùng nút vào phòng học được trang hiển thị để chuyển sang buổi học trực tuyến. Nếu phòng báo **CHƯA HOẠT ĐỘNG**, kiểm tra lại giờ học và thông báo của giáo viên.",
      },
      {
        title: "Theo dõi hoạt động và học tiếp",
        text: "Phía dưới có Hoạt động gần đây, lối vào Phòng Thi Tốt Nghiệp và Phòng Luyện Công. Nếu cần ôn bài, mở Kho tài liệu để xem các video mà tài khoản được quyền truy cập.",
      },
    ],
    note: "Lịch hiển thị khi khảo sát: Hoà Bình tối Thứ Sáu, Hạnh Phúc tối Thứ Bảy, 19:00–21:00. Luôn ưu tiên lịch hiện tại trên Giảng đường và thông báo mới của giáo viên.",
    cta: { label: "Mở Giảng đường", href: `${P}giang-duong.html` },
    image: {
      src: `${B}/AVvXsEiK02KRTY0zKmTZRIvMuhp_ikqMnlWP_a52e9NblSoeK8cHiGtFCpamOiR-MJnFHwAkt8aPJiEMUSxT7aA5YiAML1kTY-XdKKe2zXI7hyphenhyphen2qhCDEY9p8taBwkpnejbU6DYfvnEJMV8-k_RxJpeKWTSXhEBbEZjfahbE1nJ9A4pYq6JBqu3jd0ksCuaxF4tl5/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: hai ô kiểm tra mã vào lớp và lối sang Phòng Luyện Công.",
      w: 810,
      h: 575,
    },
    video: { title: "Vào Giảng đường", youtubeId: "oprSOsDV6y8" },
  },
  {
    id: "td-luyen-cong",
    no: "03",
    title: "Cùng đồng môn luyện công",
    sub: "Mỗi người một bộ đề, cùng đóng góp thành tích cho phòng.",
    steps: [
      {
        title: "Xác minh và khởi động",
        text: "Xác minh mã với Minh Hồng, mở Phòng Luyện Công rồi bấm **Bấm vào đây để khởi động Phòng Luyện Công**. Kiểm tra hồ sơ, vé và lượt còn lại.",
      },
      {
        title: "Tạo phòng hoặc nhập mã phòng",
        text: "Người tổ chức bấm **Tạo Phòng Luyện Công**, đặt tên và chia sẻ mã phòng cho nhóm. Thành viên nhập mã vào ô tham gia rồi bấm **Tìm phòng**. Cần ít nhất 1 vé và còn lượt trong ngày.",
      },
      {
        title: "Sẵn sàng và trả lời",
        text: "Bấm **Sẵn sàng** hoặc nút vào thi. Mỗi người có tối đa 10 câu trong 10 phút. Chọn A, B, C hoặc D rồi bấm **Xác nhận đáp án**. Trả lời sai hoặc hết giờ thì lượt thi kết thúc.",
      },
      {
        title: "Chờ kết quả và xác nhận vé",
        text: "Theo dõi kết quả cá nhân đến khi vé được xác nhận. Không tải lại toàn trang trong lúc làm bài. Nếu ảnh câu hỏi bị lỗi, dùng **Tải lại ảnh**.",
      },
      {
        title: "Trưởng phòng tổng kết",
        text: "Trưởng phòng bấm **Đọc lại danh sách học viên**, kiểm tra kết quả và vé rồi mới bấm **Tổng kết và phát thưởng cho nhóm hợp lệ**. Thành viên chờ tổng kết, không tự bấm nhận thưởng riêng.",
      },
    ],
    note: "Theo thể lệ hiện tại: tối đa 2 lượt/ngày, ở hai phòng khác nhau; tối đa 10 người/phòng. Vé bị trừ khi tạo hoặc vào phòng và không hoàn lại. Muốn được tính thưởng cần kết quả đã ghi nhận, vé đã xác nhận và điểm lớn hơn 0. Đọc thể lệ trên trang trước khi tham gia.",
    cta: { label: "Mở Phòng Luyện Công", href: `${P}luyen-cong.html` },
    image: {
      src: `${B}/AVvXsEgILpSGK3v8Q7UTApXgYktVNMn7Vq8XT83lGy_2qV1T-7ZUJXiSdcld1oNSPRFKg7m2zxw6Hyw8Fqq24vT_CtiyFoIHU9OdYtRh_EW6sUJU_4NSN8Gn99UXUYTITfE7C1LeB3wB6H-GWes7-hnZyMDFMk10LxFDOl_NNM16WbaTy0kAXtk02UD4s530glry/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: trạng thái nhận diện và banner khởi động Phòng Luyện Công.",
      w: 810,
      h: 596,
    },
    video: { title: "Cùng đồng môn luyện công", youtubeId: "tn_6ltK-4oA" },
  },
  {
    id: "td-nhiem-vu",
    no: "04",
    title: "Nhận nhiệm vụ, tiến từng bước",
    sub: "Biến bài học thành những mục tiêu cụ thể.",
    steps: [
      {
        title: "Vào OCD Quest",
        text: "Từ trang chủ chọn **Nhiệm vụ**. Xác minh mã học viên với Minh Hồng để hiển thị tiến độ của chính mình.",
      },
      {
        title: "Mở nhiệm vụ đang khả dụng",
        text: "Đọc tên, yêu cầu và điều kiện của nhiệm vụ. Làm theo bước nhận nhiệm vụ hoặc nói chuyện với nhân vật mà trang yêu cầu. Một số nhiệm vụ chỉ mở sau nhiệm vụ trước.",
      },
      {
        title: "Thực hiện đầy đủ từng yêu cầu",
        text: "Nhiệm vụ có thể yêu cầu nộp bài, trả lời câu hỏi, gặp nhân vật hoặc sở hữu vật phẩm. Với bài nộp, ghi chính xác mã yêu cầu vào mục ghi chú/mô tả. Ví dụ: nếu yêu cầu T1, nhập đúng **T1**.",
      },
      {
        title: "Kiểm tra tiến độ rồi nhận thưởng",
        text: "Sau khi hoàn thành, bấm **Kiểm tra tiến độ**. Khi đủ điều kiện, bấm **Đã hoàn thành yêu cầu – Nhận thưởng** và chờ xác nhận. Nếu dữ liệu bài vừa nộp chưa về, chờ rồi kiểm tra lại, đừng gửi trùng.",
      },
    ],
    note: "Danh sách nhiệm vụ và sự kiện thay đổi theo thời điểm. Phần Chinh phục Linh Thú có thể có giờ mở, vai trò trợ giảng và thể lệ riêng; hãy đọc hướng dẫn của sự kiện đang diễn ra.",
    cta: { label: "Mở trang Nhiệm vụ", href: `${P}quest.html` },
    image: {
      src: `${B}/AVvXsEhNNRjZb-rj3xQuRXRmCpC4DTO2e8vfR7GYESeE9eegggwFsq_wvbdIFGWK2wJutq-bYlJq2QLsyytl55DomkhrjnhQxtcpfuCeYz2v7OXZ6ZpZlrT_QbLK9hgLqqS4XNC8zSaEPUrAR0dANI1K2KqSL-d8H97EHX6KpXELS2G9xUHsfnhQr2q26GdT4jLz/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: trang Nhiệm vụ, khu vực nhân vật và danh sách thử thách.",
      w: 810,
      h: 600,
    },
    video: { title: "Nhận nhiệm vụ, tiến từng bước", youtubeId: "z_S_N9ULWuQ" },
  },
  {
    id: "td-nop-bai",
    no: "05",
    title: "Nộp bài tập đúng cách",
    sub: "Gửi một lần, kiểm tra lại trong lịch sử.",
    steps: [
      {
        title: "Chuẩn bị bài và ảnh",
        text: "Làm đúng đề được giao, chụp bài rõ nét, đủ ánh sáng và trọn nội dung. Ghi lại tên bài hoặc mã nhiệm vụ để tránh nhầm.",
      },
      {
        title: "Tra cứu đúng học viên",
        text: "Mở **Nộp bài tập** trên menu chính. Nhập mã rồi bấm **TRA CỨU**. Kiểm tra hồ sơ hiện ra đúng là của mình.",
      },
      {
        title: "Mở biểu mẫu nộp bài",
        text: "Bấm **Nộp bài tập** trong hồ sơ. Phiên bản đang chạy mở Google Form ở tab mới. Nếu chưa thấy form, kiểm tra tab mới hoặc thông báo chặn cửa sổ bật lên.",
      },
      {
        title: "Kiểm tra thông tin rồi gửi",
        text: "Trong form, đối chiếu mã học viên, nhập đúng nội dung bài và mã ghi chú/mô tả theo đề. Chọn ảnh theo yêu cầu biểu mẫu, sau đó gửi và chờ xác nhận thành công.",
      },
      {
        title: "Đối chiếu lịch sử",
        text: "Quay về hồ sơ, mở **Danh sách bài đã nộp** sau khi hệ thống đồng bộ. Có bản ghi chưa đồng nghĩa đã có điểm; điểm và nhận xét xuất hiện sau khi bài được chấm.",
      },
    ],
    note: "Nếu trang báo vượt số bài trong ngày, không gửi lặp để vượt giới hạn. Nếu nhập sai mã hoặc bài chưa xuất hiện sau khi chờ đồng bộ, báo người phụ trách kèm tên bài và thời điểm nộp.",
    cta: { label: "Mở trang Nộp bài", href: `${P}nop-bai.html` },
    image: {
      src: "/images/huong-dan-nop-bai.webp",
      alt: "Ảnh thực tế: tra cứu mã học viên trước khi mở chức năng nộp bài.",
      w: 810,
      h: 310,
    },
    video: { title: "Nộp bài tập đúng cách", youtubeId: "QipRJFYM4w0" },
  },
  {
    id: "td-ho-so",
    no: "06",
    title: "Xem hồ sơ và ghé Chợ phiên",
    sub: "Theo dõi sự tiến bộ của chính mình.",
    steps: [
      {
        title: "Mở đúng trang hồ sơ",
        text: "Từ menu chọn **Tra cứu → Học viên**, hoặc mở liên kết bên dưới. Nhập mã và bấm **TRA CỨU**.",
      },
      {
        title: "Đọc thông tin học tập",
        text: "Xem tổ, khóa, điểm trung bình, điểm xếp hạng và danh sách bài đã nộp. Đọc nhận xét của giáo viên để biết phần cần sửa trong bài tiếp theo.",
      },
      {
        title: "Theo dõi tài sản và tiến bộ",
        text: "Mở các phần Linh thạch, vật phẩm và phân tích cá nhân. Biểu đồ cần đủ bài đã được chấm mới thể hiện rõ tiến trình.",
      },
      {
        title: "Sử dụng Chợ phiên khi cần",
        text: "Mở **Chợ phiên thu đổi linh thạch**, xem vật phẩm hoặc kèo đổi đang có. Đọc kỹ chi phí, số lượng và Phiếu đổi quà trước khi bấm xác nhận. Chờ giao dịch hoàn tất rồi đối chiếu lại số dư.",
      },
    ],
    // Trang cũ ghi "/p/tra-cuu.html" và "/p/ho-so.html"; đổi sang đường dẫn của app mới.
    note: "Đừng nhầm đường dẫn: **/tra-cuu/hoc-vien** là hồ sơ và Chợ phiên; **/bang-xep-hang** hiện là bảng xếp hạng cá nhân và tập thể.",
    cta: { label: "Mở Hồ sơ & Chợ phiên", href: `${P}tra-cuu.html` },
    image: {
      src: `${B}/AVvXsEinbudPuuqVyo29EVLyMVGev98VpqlMCupaxZlXhLX1QYuIZMf7ZzFKFs0HBqplRXY6qPpIdkCMGJKtvSiXFBeZMHDUIFBbMWJTLX4WP6l00DpLScAAlaQEExTWyUbzf7_Kh3UCFaYvkIbv7UyBFvRq2-iTIXgzk6_Ezio6m8C_O4ImaqhVgtO0wg838oKZ/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: ô tra cứu hồ sơ và mục mở Chợ phiên.",
      w: 815,
      h: 440,
    },
    video: { title: "Xem hồ sơ và ghé Chợ phiên", youtubeId: "eNatRCUPwkg" },
  },
  {
    id: "td-thu-hang",
    no: "07",
    title: "Xem thứ hạng cá nhân và tổ",
    sub: "Chọn đúng tiêu chí để hiểu đúng kết quả.",
    steps: [
      {
        title: "Chọn bảng cần xem",
        text: "Mở **Bảng xếp hạng** từ trang chủ. Chọn phần **XẾP HẠNG THEO TỔ** hoặc **XẾP HẠNG HỌC VIÊN**.",
      },
      {
        title: "Chọn tiêu chí",
        text: "Có các lựa chọn Rank tổng, điểm trung bình, bền bỉ, năng nổ và phú hào. Mỗi tiêu chí phản ánh một khía cạnh khác nhau, vì vậy thứ tự có thể khác nhau.",
      },
      {
        title: "Lọc tổ hoặc khóa",
        text: "Chọn khóa học; với bảng học viên có thể chọn thêm tổ. Bấm **ÁP DỤNG** để xem kết quả theo bộ lọc.",
      },
      {
        title: "Đọc kết quả và bỏ lọc khi cần",
        text: "Xem chỉ số đang xếp và tiến độ Rank. Dùng **XÓA LỌC** để trở về phạm vi tổng quát. Nếu dữ liệu vừa thay đổi, chờ đồng bộ trước khi đối chiếu.",
      },
    ],
    note: "Trang hiện giải thích Rank tổng = số bài hợp lệ + tổng điểm các bài hợp lệ đã được chấm. Rank tổng không phải điểm trung bình và không thay cho đánh giá từng bài của giáo viên.",
    cta: { label: "Mở Bảng thứ hạng", href: `${P}ho-so.html` },
    image: {
      src: `${B}/AVvXsEhOV7-1xRgvyfAeYcKmXw8sgftN-K6Ri1ubcbZl2n8jzQ34LBye47Uc0uOuIGrv-gJ0FsVQWI8SNLQNU-1-t1dn08F8AH2BSv4K4FjRJboyMXuaAnhaY29E1z86gsts6CbtfaiJLgwB6vS9_wNJilGcAlNCqAOsCE-px_zO8Fn9HqfK0ZFk9AyFgUjwJBm_/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: chọn tiêu chí, tổ, khóa và bấm ÁP DỤNG.",
      w: 812,
      h: 550,
    },
    video: { title: "Xem thứ hạng cá nhân và tổ", youtubeId: "nNGhmK371BI" },
  },
  {
    id: "td-trien-lam",
    no: "08",
    title: "Dạo Phòng triển lãm",
    sub: "Học cách nhìn một tác phẩm, nuôi cảm hứng luyện tập.",
    steps: [
      {
        title: "Mở không gian trưng bày",
        text: "Từ trang chủ bấm **PHÒNG TRIỂN LÃM**. Đây là nơi giới thiệu những tác phẩm được giáo viên chủ nhiệm lựa chọn.",
      },
      {
        title: "Tìm tác phẩm muốn xem",
        text: "Gõ tên học viên hoặc tên bài tập. Có thể lọc theo khóa, tổ và sắp xếp Mới nhất hoặc Cũ nhất.",
      },
      {
        title: "Mở ảnh và quan sát",
        text: "Bấm tác phẩm để xem lớn; dùng **Mở ảnh gốc** khi cần xem chi tiết. Quan sát bố cục, độ đậm nhạt, nhịp nét và khoảng trống để rút ra điều mình muốn luyện.",
      },
      {
        title: "Tiếp tục luyện và nộp bài",
        text: "Tác phẩm được giới thiệu theo lựa chọn của giáo viên. Nộp bài không có nghĩa bài sẽ tự động lên triển lãm. Muốn xem đầy đủ lượt nộp của mình, hãy quay về hồ sơ.",
      },
    ],
    note: "Nếu không thấy kết quả, bấm **Đặt lại bộ lọc**. Ảnh và số lượng tác phẩm trong bài hướng dẫn là ảnh chụp tại thời điểm khảo sát, có thể thay đổi sau này.",
    cta: { label: "Mở Phòng triển lãm", href: `${P}trien-lam.html` },
    image: {
      src: `${B}/AVvXsEijkwhvQHT-ogeJi-2XG_3gy7TkxS617DEYaf9kMlPGCGp0PboNmQQn6c-U1Nw4NQ1G4UIQPiO7x6baXpsnNRiMCTNWhD2dylvx9GUFsu9kI4TU5t5Xwv-GCkqfB-E06UtG_crZEO_KO7vUoNKU8BCtRyvvxjwrj-6y4qSofJ-9qgH0ckEfYIQXvzscmbJY/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: bộ lọc tìm tên, khóa, tổ và thứ tự tác phẩm.",
      w: 810,
      h: 548,
    },
    video: { title: "Dạo Phòng triển lãm", youtubeId: "HwfavJFoqHk" },
  },
  {
    id: "td-thu-vien",
    no: "09",
    title: "Ôn bài với thư viện",
    sub: "Từ mẫu lâm mô đến video bài giảng.",
    steps: [
      {
        title: "Tìm mẫu phù hợp",
        text: "Vào Thư viện lâm mô, tìm theo nội dung, người viết, tác giả hoặc chủ đề. Lọc thêm số lượng chữ và mốc điểm kinh nghiệm. Xác minh học viên để mở các tài liệu phù hợp quyền truy cập.",
      },
      {
        title: "Quan sát rồi luyện tập",
        text: "Mở mẫu, đọc Thông tin lâm mô. Có thể **Bật / Tắt ô Mễ** và **Tạo bản in** để hỗ trợ quan sát, luyện tập.",
      },
      {
        title: "Gửi bài và chia sẻ bản lâm",
        text: "Dùng **Gửi bài tập ngay** và làm theo hướng dẫn nộp. Khi sử dụng chức năng **Khoe bản lâm**, chờ trang xác nhận trước khi đóng.",
      },
      {
        title: "Xem lại bài giảng theo quyền",
        text: `Mở [Kho tài liệu](${P}tai-lieu.html), nhập mã học viên hoặc trợ giảng và đăng nhập. Chọn Video xem lại, Video hướng dẫn hoặc Tài liệu tham khảo. Một số video cần quyền nâng cấp hoặc đúng khóa học.`,
      },
    ],
    note: "Mẫu trong thư viện phục vụ học tập, lâm mô; không tự ý sử dụng thương mại. Nếu không mở được video, kiểm tra đúng tài khoản và quyền của nội dung đó.",
    cta: { label: "Mở Thư viện lâm mô", href: `${P}thu-vien-lam-mo.html` },
    image: {
      src: `${B}/AVvXsEhWq7e152ZHE1s1OnwffJjNSzsGyN-Onlcn_C26jyoC4v1xz5HELbM6gulq6jzgLDsgQjmH5_8_rCfVSH2OUg_6_buLAzbvi0zpHtGAatWzqD2Hnf0a-QlVEbo1IviH7oEpZzr8-TlQdd2Q2jsCoEFWnyhpLoXMj30IgTKtGqZMoLdsyrG2IehNIBN3Kyo5/s1600-rw/image.webp`,
      alt: "Ảnh thực tế: tìm kiếm và lọc mẫu lâm mô theo nhu cầu luyện tập.",
      w: 814,
      h: 605,
    },
    // Trang cũ đang dùng cùng một video cho mục 08 và 09 (xem LESSONS_LEARNED L-021).
    video: { title: "Ôn bài với thư viện", youtubeId: "HwfavJFoqHk" },
  },
];

/**
 * Hỏi đáp ở cuối trang Hướng dẫn. Danh sách câu hỏi nằm trong `guide-faq.json` (mảng {question, answer}):
 * thêm/sửa/xóa câu hỏi ở đó, trang tự cập nhật, không phải sửa mã.
 */
export const guideHelp = {
  title: "Khi cần một chút trợ giúp",
  items: guideFaq as GuideFaqItem[],
  more: { label: "Hỏi đáp nhanh", href: `${P}hoi-dap.html` },
};
