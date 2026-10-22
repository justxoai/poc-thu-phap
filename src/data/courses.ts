/**
 * Khóa học, gói học và nội quy (chép từ https://www.thudao.com/p/dang-ky-hoc.html, đọc ngày 19/10/2026).
 * Học phí ở đây là nguồn duy nhất: Server Action luôn tra lại giá theo mã khóa/gói, không nhận giá từ trình duyệt.
 */

export interface PackageDef {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  hot?: boolean;
  yes: string[];
  no?: string[];
}

export interface CourseDef {
  id: string;
  name: string;
  summary: string;
  meta: string[];
  /** Ghép vào nội dung chuyển khoản (ví dụ TUHOC). */
  payTag?: string;
  packageIds: string[];
  open: boolean;
}

const documents = [
  'Tài liệu "Thư pháp Việt – Dành cho người mới bắt đầu" Quyển 1 (bản PDF)',
  "Xem lại video trọn đời",
  "Học ngay lập tức, không cần chờ khoá khai giảng",
  "Mở đầy đủ: nộp bài, xem tiến trình, làm nhiệm vụ",
  "Tham gia mini-game và Chợ phiên",
];
const standard = [
  ...documents,
  "Dụng cụ viết thư pháp gửi tận nhà",
  'Sách "Thư pháp Việt" Quyển 1 (bản in)',
  "01 danh chương tên thật, vuông 1,5 cm",
];
const vip = [...standard, "Thêm 01 ấn nhàn chương 1,5 cm đá đẹp", "Được Giảng viên ưu tiên nhận xét, chấm điểm"];

export const packages: PackageDef[] = [
  {
    id: "mien-phi",
    name: "Gói Miễn phí",
    price: 0,
    yes: ["Vào lớp khi khoá mới khai giảng", "Hướng dẫn lý thuyết và kỹ thuật cơ bản", "Video bài giảng ghi lại"],
    no: ["Tự chuẩn bị bút, mực, giấy, nghiên", "Không kèm triện và tài liệu"],
  },
  { id: "ung-ho", name: "Gói Ủng hộ", price: 800_000, yes: documents, no: ["Tự chuẩn bị đồ dùng học tập"] },
  { id: "pho-thong", name: "Gói Phổ thông", price: 3_500_000, oldPrice: 5_000_000, hot: true, yes: standard },
  { id: "vip", name: "Gói VIP", price: 9_000_000, oldPrice: 12_000_000, yes: vip },
];

export const courses: CourseDef[] = [
  {
    id: "OCD-MEET",
    name: "Khoá học Thư pháp Việt căn bản Online - 52 buổi qua Meet",
    summary:
      "Chương trình đào tạo toàn diện 52 buổi học trực tuyến qua Google Meet – hành trình giúp bạn đi từ người mới bắt đầu đến khi làm chủ nét chữ.",
    meta: ["Học trực tuyến qua Meet", "52 buổi", "Giảng viên & trợ giảng chấm bài", "Có chứng nhận hoàn thành"],
    packageIds: ["mien-phi", "ung-ho", "pho-thong", "vip"],
    open: true,
  },
  {
    id: "OCD-TUHOC",
    name: "Khoá học thư pháp Việt căn bản Online - Tự học",
    summary:
      "Học theo lộ trình 52 bài thư pháp Việt căn bản theo tốc độ của riêng bạn, với video bài giảng và tài liệu của lớp.",
    meta: ["Tự học Online", "Lộ trình 52 bài", "Học theo tốc độ riêng", "Mã học viên có hiệu lực khi được duyệt"],
    payTag: "TUHOC",
    packageIds: ["ung-ho", "pho-thong", "vip"],
    open: true,
  },
];

export function findCourse(id: string): CourseDef | undefined {
  return courses.find((c) => c.id === id);
}

export function findPackage(id: string): PackageDef | undefined {
  return packages.find((p) => p.id === id);
}

/** Gói hợp lệ cho một khóa (khóa Tự học không có gói miễn phí). */
export function packagesOf(course: CourseDef): PackageDef[] {
  return course.packageIds.map((id) => findPackage(id)).filter((p): p is PackageDef => p !== undefined);
}

export const registerHero = {
  mark: "THANH PHONG THƯ MÔN · ĐĂNG KÝ HỌC",
  title: "Tham gia cộng đồng lớp học thư pháp Online",
  lead: "Chọn khoá học và gói học phù hợp. Thông tin đăng ký được gửi thẳng tới giáo viên; mã học viên có hiệu lực khi hồ sơ được duyệt.",
  steps: ["Chọn khoá học và gói học", "Gửi phiếu đăng ký, chuyển khoản nếu có", "Nhận mã học viên khi được duyệt"],
};

export const registerRules = {
  title: "Nội quy lớp học Thanh Phong Thư Môn",
  groups: [
    {
      title: "1. Chuẩn bị & Nhập học",
      items: [
        "Kênh thông tin: Học viên vui lòng tham gia các nhóm Zalo/Facebook chính thức để nhận hỗ trợ và hoàn tất thủ tục đăng ký.",
        "Dụng cụ học tập: Chủ động chuẩn bị trọn bộ \"Văn phòng tứ bảo\" trước ngày khai giảng.",
        "Tôn trọng không gian chung: Học viên tự do lựa chọn nơi mua sắm dụng cụ. Nhóm lớp chỉ phục vụ mục đích học tập, tuyệt đối không thương mại hóa, quảng cáo hoặc môi giới bán hàng.",
      ],
    },
    {
      title: "2. Kỷ luật & Tự giác",
      lead: "Lớp học áp dụng hình thức tạm dừng quyền tham gia đối với các trường hợp:",
      items: [
        "Vắng mặt 03 buổi liên tiếp không có lý do.",
        "Không nộp bài tập về nhà 03 buổi liên tiếp.",
        "Nằm trong nhóm kết quả kém nhất ở 03 bài kiểm tra liên tiếp.",
        "Ngôn từ thiếu tôn trọng người khác hoặc vi phạm các quy định pháp luật, chính trị.",
      ],
    },
    {
      title: "3. Tôn trọng Tri thức & Thương hiệu",
      items: [
        "Bản quyền & Danh nghĩa: Nghiêm cấm việc tự ý sử dụng danh nghĩa \"Học trò Thanh Phong\" hoặc dùng kiến thức của môn phái để mở lớp, kinh doanh khi chưa có sự đồng ý chính thức từ Giảng viên.",
        "Thời gian rèn luyện: Khi chưa hoàn thành chương trình học, học viên không tự ý mở lớp dạy lại hoặc thu phí người khác.",
      ],
    },
    {
      title: "4. Tâm thế & Tinh thần học tập",
      items: [
        "Rèn tâm chớ tìm vui: Học thư pháp là quá trình rèn luyện tính kiên nhẫn và đón nhận góp ý thẳng thắn. Nếu chỉ tìm kiếm sự thư giãn đơn thuần hay có lòng tự tôn quá cao, lớp học có thể chưa phải là lựa chọn phù hợp nhất với bạn.",
        "Tương tác tích cực: Khuyến khích học viên thường xuyên trao đổi, bình luận xây dựng bài.",
      ],
    },
  ],
};

export const registerCourses = {
  title: "Các khoá học",
  lead: "Chọn một khoá để xem gói học, rồi điền phiếu đăng ký bên dưới.",
  open: "ĐANG NHẬN ĐĂNG KÝ",
  closed: "TẠM ĐÓNG",
};

export const registerSupport = "Cần hỗ trợ? Gọi 0395 021 559 · vnthudao@gmail.com · Kim Mã, Giảng Võ, Hà Nội";
