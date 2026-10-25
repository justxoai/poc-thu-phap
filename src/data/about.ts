/**
 * Nội dung trang Giới thiệu (sao chép nguyên văn từ https://www.thudao.com/p/gioi-thieu.html).
 * Đoạn văn là mảng "run": chuỗi thường hoặc { b: "..." } để in đậm.
 */

import { aboutImages, type RemoteImage } from "./about-images";

export type Run = string | { b: string };
export type Paragraph = Run[];

export const aboutHero = {
  mark: "VIỆT THƯ ĐẠO QUÁN",
  title: "Học thư pháp không chỉ là học viết một con chữ",
  sub: "Thudao.com là không gian chia sẻ kiến thức, học tập và rèn luyện thư pháp Việt, được xây dựng để kết nối người học với bài giảng, tư liệu và hành trình tiến bộ của chính mình.",
  banner: aboutImages.banner,
};

export const aboutVenue = {
  title: "Về Việt Thư Đạo Quán",
  lead: "Một không gian dành cho những người yêu thư pháp Việt và nghệ thuật truyền thống.",
  paragraphs: [
    [
      { b: "Việt Thư Đạo Quán" },
      " là nơi giao lưu, chia sẻ kiến thức và kinh nghiệm học tập ",
      { b: "thư pháp Việt" },
      " cùng ",
      { b: "thủy mặc" },
      " của thầy, trò và các thành viên trong cộng đồng.",
    ],
    [
      "Website được xây dựng với mong muốn tạo nên một không gian để lưu giữ tư liệu, chia sẻ kinh nghiệm, hỗ trợ việc học tập và kết nối những người có chung niềm yêu thích với nghệ thuật thư pháp.",
    ],
  ] satisfies Paragraph[],
  facts: [
    { label: "Người sáng lập", value: "Bùi Khắc Sáng" },
    { label: "Website", value: "thudao.com" },
    { label: "Thành lập", value: "Tháng 3/2021" },
  ],
};

export const aboutFounder = {
  title: "Về Thanh Phong",
  lead: "Người xây dựng website và đồng hành cùng học viên trong quá trình học tập.",
  role: "NGƯỜI SÁNG LẬP",
  name: "Bùi Khắc Sáng",
  photo: aboutImages.founder,
  rows: [
    { label: "Bút danh:", text: "Thanh Phong" },
    { label: "Quê quán:", text: "Hải Trung, Hải Hậu, Nam Định" },
    { label: "2014:", text: "Bắt đầu biết tới và tìm hiểu thư pháp Việt." },
    { label: "2018:", text: "Sáng lập website thuphapthanhphong.com." },
    { label: "2021:", text: "Sáng lập thudao.com." },
  ],
  quote:
    "“Mình chỉ là người đi trước các bạn, nhưng không có nghĩa là mình giỏi hơn. Việc luyện tập và tìm kiếm cái đẹp là việc làm cả đời và vô cùng vất vả. Nhìn chung, đối với các nền thư pháp khác trên thế giới, chúng ta mới chỉ là những người đi sau, nền tảng còn thiếu và cộng đồng còn yếu. Chỉ có đoàn kết nhau lại mới hy vọng vào một tương lai thư pháp Việt lớn mạnh và đủ tầm để trở thành một bộ môn được mọi người công nhận.”",
  quoteAuthor: "— Thanh Phong",
};

export type AboutFeature = {
  tag: string;
  title: string;
  href: string;
  cta: string;
  image: RemoteImage;
  paragraph: Paragraph;
};

export const aboutSite = {
  title: "Về Thudao.com",
  lead: "Không chỉ cung cấp thông tin, website còn là một phần của hành trình học tập.",
  cards: [
    {
      title: "Hành trình bắt đầu từ đây",
      text: "Học thư pháp từng bước một thông qua các bài viết được chia sẻ trên website của Thư Đạo. Bạn có thể tìm thấy các bài viết chia sẻ kinh nghiệm, kiến thức liên quan tới thư pháp.",
    },
    {
      title: "Thông tin bổ ích giúp tiết kiệm thời gian",
      text: "Khám phá những thông tin được chia sẻ trên blog bao gồm những bài giảng, tài liệu của các nghệ sỹ dày dặn kinh nghiệm.",
    },
    {
      title: "Tham gia các thử thách theo từng tuần, quý",
      text: "Những sự kiện được tổ chức thường kỳ liên quan tới thư pháp được xây dựng bài bản giúp bạn có được nguồn cảm hứng bất tận với môn học này.",
    },
    {
      title: "Cải thiện bản thân",
      text: "Thư pháp là cuộc sống, người viết chữ có thể tự mình phát triển kiến thức cuộc sống thông qua thư pháp, tìm thêm những người bạn mới, thông qua diễn đàn, khung chat của blog.",
    },
  ],
  paragraphs: [
    [
      { b: "Thudao.com" },
      " là không gian đồng hành cùng học viên trên hành trình học tập, rèn luyện và khám phá nghệ thuật thư pháp.",
    ],
    [
      "Website kết nối việc học với một hệ thống trực tuyến giúp học viên tra cứu, theo dõi, ôn luyện và nhìn lại quá trình tiến bộ của mình một cách rõ ràng hơn.",
    ],
    [
      "Mỗi bài viết, mỗi kết quả học tập và mỗi tác phẩm đều có thể trở thành một dấu mốc trên hành trình ",
      { b: "rèn chữ – luyện tâm" },
      ".",
    ],
  ] satisfies Paragraph[],
  features: [
    {
      tag: "HỒ SƠ HỌC TẬP",
      title: "Tra cứu kết quả và quá trình học tập",
      href: "/tra-cuu/hoc-vien",
      cta: "Tra cứu học viên",
      image: aboutImages.profile,
      paragraph: [
        "Học viên có thể tra cứu thông tin cá nhân và kết quả học tập để theo dõi quá trình của mình qua từng giai đoạn. Việc tổng hợp dữ liệu giúp mỗi người nhận ra những nội dung đã làm tốt và những phần cần tiếp tục rèn luyện.",
      ],
    },
    {
      tag: "GHI NHẬN NỖ LỰC",
      title: "Bảng xếp hạng thành tích",
      href: "/bang-xep-hang",
      cta: "Xem bảng xếp hạng",
      image: aboutImages.ranking,
      paragraph: [
        "Bảng xếp hạng ghi nhận những kết quả và nỗ lực trong quá trình học tập. Mục tiêu không chỉ là thứ hạng, mà còn tạo thêm động lực để học viên duy trì sự chuyên cần và từng bước vượt qua chính mình.",
      ],
    },
    {
      tag: "CÙNG HỌC – CÙNG TIẾN BỘ",
      title: "Theo dõi kết quả giữa các nhóm học",
      href: "/tra-cuu/can-su-lop",
      cta: "Xem kết quả các nhóm",
      image: aboutImages.groups,
      paragraph: [
        "Kết quả của các nhóm giúp học viên có thêm một góc nhìn tổng quan về hoạt động học tập. Việc so sánh không nhằm tạo áp lực cạnh tranh, mà hướng tới tinh thần cùng học, cùng cố gắng và cùng nâng cao chất lượng rèn luyện.",
      ],
    },
    {
      tag: "HỌC LẠI KHI CẦN",
      title: "Xem lại bài giảng",
      href: "/tai-lieu",
      cta: "Xem tài liệu bài giảng",
      image: aboutImages.lectures,
      paragraph: [
        "Không phải lúc nào một bài học cũng có thể được ghi nhớ trọn vẹn ngay từ lần đầu. Hệ thống bài giảng giúp học viên quay lại nội dung đã học, ôn những kỹ thuật chưa thuần thục và chủ động luyện tập vào thời gian phù hợp: ",
        { b: "xem lại, luyện lại và hiểu sâu hơn." },
      ],
    },
    {
      tag: "QUAN SÁT – THỰC HÀNH",
      title: "Thư viện Lâm Mô Thư Pháp",
      href: "/mau-lam-mo",
      cta: "Vào thư viện Lâm Mô",
      image: aboutImages.copyLibrary,
      paragraph: [
        "Thư viện Lâm Mô là không gian dành cho việc quan sát, học tập và thực hành thông qua các mẫu chữ, tác phẩm và tư liệu thư pháp. Qua quá trình lâm mô, người học có thể quan sát kỹ hơn kết cấu chữ, nét bút, bố cục và thần thái để từng bước hình thành khả năng cảm nhận và thực hành của riêng mình.",
      ],
    },
  ] satisfies AboutFeature[],
};

export const aboutPhilosophy = {
  label: "TINH THẦN CỦA THUDAO.COM",
  title: "Mỗi con chữ là một bước tiến",
  paragraphs: [
    [
      "Thudao.com được xây dựng với mong muốn biến quá trình học thư pháp thành một hành trình ",
      { b: "có thể theo dõi, có thể nhìn lại" },
      " và có thể tiến bộ từng ngày.",
    ],
    [
      "Từ một kết quả học tập, một bài giảng được xem lại, một tác phẩm được hoàn thành cho tới một nét bút ngày càng vững vàng — tất cả đều là những dấu mốc đáng trân trọng.",
    ],
  ] satisfies Paragraph[],
  main: ["Thư đạo không chỉ là học chữ.", "Đó còn là học sự kiên nhẫn, sự tập trung và cách hoàn thiện chính mình qua từng nét bút."],
  closing:
    "Điều quan trọng không phải là đi thật nhanh, mà là có thể nhìn lại và nhận ra hôm nay mình đã tiến thêm một chút so với ngày hôm qua.",
};

export const aboutEnd = {
  photo: aboutImages.endPhoto,
  title: "Tâm an – Bút vững",
  text: "Chúc bạn luôn giữ được sự kiên trì, niềm vui và tình yêu với con chữ trên hành trình học tập và khám phá nghệ thuật thư pháp Việt.",
};
