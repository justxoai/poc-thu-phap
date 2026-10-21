/**
 * Nội dung trang Hỏi đáp nhanh (chép nguyên văn từ https://www.thudao.com/p/hoi-dap.html, 25 câu).
 * Link tuyệt đối tới trang cũ được đổi sang đường dẫn mới bởi lib/links.ts khi hiển thị.
 */

export type FaqBlock =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "note" | "warning"; text: string }
  | { kind: "buttons"; buttons: { label: string; href: string }[] };

export type FaqEntry = { question: string; blocks: FaqBlock[] };

export type FaqCategoryId = "dang-ky" | "hoc-tap" | "nop-bai" | "tra-cuu" | "phan-thuong" | "ky-thuat";

export type FaqSection = {
  id: FaqCategoryId;
  icon: string;
  title: string;
  note: string;
  /** Nhãn của nút lọc */
  filterLabel: string;
  items: FaqEntry[];
};

const p = (text: string): FaqBlock => ({ kind: "p", text });
const note = (text: string): FaqBlock => ({ kind: "note", text });
const warning = (text: string): FaqBlock => ({ kind: "warning", text });
const ul = (...items: string[]): FaqBlock => ({ kind: "ul", items });
const ol = (...items: string[]): FaqBlock => ({ kind: "ol", items });
const buttons = (...list: [string, string][]): FaqBlock => ({
  kind: "buttons",
  buttons: list.map(([label, href]) => ({ label, href })),
});

export const faqHero = {
  mark: "CẨM NANG DÀNH CHO NGƯỜI MỚI",
  title: "Một số câu hỏi thường gặp",
  lead: "Tổng hợp những thông tin cơ bản giúp học viên mới làm quen với lớp học, website, cách nộp bài, tra cứu kết quả và hệ thống phần thưởng của Thanh Phong Thư Môn.",
  startTitle: "Người mới nên bắt đầu từ đâu?",
  steps: [
    { title: "Hoàn thành đăng ký", text: "Điền đúng thông tin và số điện thoại để được xác nhận." },
    { title: "Vào nhóm của lớp", text: "Theo dõi thông báo và kiểm tra mình được phân vào tổ nào." },
    { title: "Học và nộp bài", text: "Dùng đúng mã học viên để hệ thống ghi nhận kết quả." },
  ],
  searchPlaceholder: "Nhập nội dung cần tìm, ví dụ: mã học viên, nộp bài...",
  emptyTitle: "Chưa tìm thấy câu hỏi phù hợp",
  emptyText: "Hãy thử từ khóa ngắn hơn hoặc chọn lại mục “Tất cả”.",
};

export const faqHelp = {
  title: "Bạn vẫn chưa tìm thấy câu trả lời?",
  text: "Hãy chuẩn bị mã học viên, ảnh chụp lỗi và mô tả ngắn gọn vấn đề để giáo viên hoặc người phụ trách có thể hỗ trợ nhanh hơn.",
  buttons: [
    { label: "MỞ TRANG HỎI ĐÁP", href: "https://www.thudao.com/p/hoi-dap.html" },
    { label: "TRA CỨU HỌC VIÊN", href: "https://www.thudao.com/p/tra-cuu.html" },
  ],
  footnote:
    "Nội dung hướng dẫn có thể được điều chỉnh theo từng khóa học. Học viên nên ưu tiên thông báo mới nhất của giáo viên chủ nhiệm.",
};

export const faqSections: FaqSection[] = [
  {
    id: "dang-ky",
    icon: "📝",
    title: "Đăng ký và nhập học",
    note: "Những điều cần biết trước khi bắt đầu khóa học",
    filterLabel: "Đăng ký",
    items: [
      {
        question: "Tôi muốn đăng ký học thì phải làm thế nào?",
        blocks: [
          p("Bạn cần điền đầy đủ thông tin trong Form đăng ký của khóa học đang tuyển sinh. Sau khi gửi Form, hãy vào nhóm Zalo chung theo hướng dẫn để nhận thông báo về phân tổ, đồ dùng học tập và ngày khai giảng."),
          note("Hãy nhập chính xác họ tên và số điện thoại. Đây có thể là thông tin dùng để đối chiếu danh sách đăng ký."),
          buttons(["XEM HƯỚNG DẪN ĐĂNG KÝ", "https://www.thudao.com/p/dang-ky-hoc.html"]),
        ],
      },
      {
        question: "Sau khi điền Form, tôi đã chính thức trở thành học viên chưa?",
        blocks: [
          p("Việc gửi Form mới là bước đăng ký ban đầu. Bạn nên tiếp tục kiểm tra thông báo của lớp, vào đúng nhóm chung và chờ xác nhận hoặc phân tổ từ giáo viên chủ nhiệm."),
          p("Khi đã được cấp mã học viên, hãy lưu lại mã này. Mã học viên được sử dụng trong nhiều chức năng như nộp bài, tra cứu hồ sơ và ghi nhận thành tích."),
        ],
      },
      {
        question: "Tôi không tìm thấy tên hoặc tổ của mình sau khi đăng ký?",
        blocks: [
          p("Trước tiên, hãy kiểm tra lại số điện thoại đã nhập có đúng với số dùng trong Form đăng ký hay không. Bạn cũng có thể thử lại sau vì danh sách phân tổ cần thời gian cập nhật."),
          p("Nếu vẫn chưa tìm thấy, hãy liên hệ giáo viên chủ nhiệm hoặc người phụ trách lớp và cung cấp:"),
          ul("Họ và tên đã đăng ký.", "Số điện thoại đã dùng trong Form.", "Thời điểm bạn gửi Form đăng ký."),
        ],
      },
      {
        question: "Tôi có thể học nếu chưa từng viết thư pháp không?",
        blocks: [
          p("Có. Người mới nên bắt đầu từ những bài cơ bản, tập đúng tư thế, cách cầm bút, điều khiển dụng bút và hoàn thành bài tập theo thứ tự giáo viên hướng dẫn."),
          p("Không cần cố viết thật đẹp ngay từ đầu. Điều quan trọng là luyện đúng phương pháp và duy trì đều đặn."),
        ],
      },
    ],
  },
  {
    id: "hoc-tap",
    icon: "🎓",
    title: "Lịch học và giảng đường",
    note: "Cách theo dõi lịch và tham gia buổi học",
    filterLabel: "Học tập",
    items: [
      {
        question: "Tôi xem lịch học mới nhất ở đâu?",
        blocks: [
          p("Lịch học được thông báo trên website và trong nhóm lớp. Bạn nên theo dõi thông báo của giáo viên chủ nhiệm vì thời gian hoặc nội dung từng buổi có thể được điều chỉnh."),
          note("Hãy ưu tiên thông báo mới nhất được đăng bởi giáo viên hoặc người phụ trách lớp."),
          buttons(["XEM THÔNG BÁO MỚI", "https://www.thudao.com/"], ["VÀO GIẢNG ĐƯỜNG", "https://www.thudao.com/p/giang-duong.html"]),
        ],
      },
      {
        question: "Vì sao tôi chưa mở được phòng học trực tuyến?",
        blocks: [
          p("Phòng học có thể chỉ mở đúng ngày, đúng khung giờ và dành cho nhóm học viên phù hợp. Bạn cần nhập đúng mã học viên nếu trang yêu cầu xác minh."),
          p("Nếu chưa đến giờ học, hệ thống có thể chưa hiển thị nút truy cập Google Meet."),
        ],
      },
      {
        question: "Nếu bỏ lỡ buổi học trực tiếp, tôi có thể xem lại không?",
        blocks: [
          p("Nếu buổi học có video xem lại, đường dẫn sẽ được cung cấp trong khu vực tài liệu, thư viện hoặc thông báo của lớp. Một số nội dung có thể chỉ dành cho học viên thuộc khóa học tương ứng."),
          buttons(["THƯ VIỆN LÂM MÔ", "https://www.thudao.com/p/thu-vien-lam-mo.html"]),
        ],
      },
      {
        question: "Người mới cần chuẩn bị những dụng cụ gì?",
        blocks: [
          p("Tùy theo nội dung khóa học, giáo viên sẽ có hướng dẫn cụ thể. Bộ dụng cụ cơ bản thường gồm bút, mực, giấy luyện tập, nghiên hoặc vật dụng đựng mực và một mặt bàn phù hợp."),
          p("Bạn không nên mua quá nhiều dụng cụ ngay từ đầu. Hãy chờ danh sách được giáo viên hướng dẫn để tránh mua nhầm loại không phù hợp."),
        ],
      },
    ],
  },
  {
    id: "nop-bai",
    icon: "🖌️",
    title: "Mã học viên và nộp bài",
    note: "Cách để bài tập được hệ thống ghi nhận chính xác",
    filterLabel: "Nộp bài",
    items: [
      {
        question: "Mã học viên dùng để làm gì?",
        blocks: [
          p("Mã học viên giúp hệ thống xác định đúng người nộp bài, tổng hợp điểm, thành tích, phần thưởng và các dữ liệu liên quan đến hồ sơ học tập."),
          warning("Không dùng mã của người khác và không tự thêm khoảng trắng, ký tự hoặc thay đổi cấu trúc mã đã được cấp."),
        ],
      },
      {
        question: "Tôi nộp bài tập ở đâu?",
        blocks: [
          p("Bạn có thể mở trang Nộp bài tập từ menu chính. Trước khi gửi, hãy kiểm tra đúng mã học viên, đúng tên bài tập và đúng hình ảnh cần nộp."),
          buttons(["MỞ TRANG NỘP BÀI", "https://www.thudao.com/p/nop-bai.html"]),
        ],
      },
      {
        question: "Làm thế nào để biết bài đã được gửi thành công?",
        blocks: [
          p("Sau khi gửi, hãy chờ thông báo xác nhận của biểu mẫu. Bạn có thể tra cứu lại hồ sơ sau khi hệ thống đồng bộ để kiểm tra lượt nộp bài đã xuất hiện hay chưa."),
          p("Không nên bấm gửi liên tục nhiều lần vì có thể tạo các bản ghi trùng nhau."),
        ],
      },
      {
        question: "Tôi nhập sai mã học viên khi nộp bài thì phải làm gì?",
        blocks: [
          p("Hãy báo sớm cho giáo viên hoặc người phụ trách chấm bài. Khi liên hệ, cần cung cấp họ tên, mã đúng, mã đã nhập sai, tên bài và thời điểm nộp để thuận tiện đối chiếu."),
          warning("Không tự nộp đi nộp lại nhiều lần nếu chưa biết bản ghi cũ sẽ được xử lý như thế nào."),
        ],
      },
      {
        question: "Vì sao bài đã nộp nhưng chưa có điểm?",
        blocks: [
          p("Bài tập cần thời gian để giáo viên hoặc trợ giảng kiểm tra. Việc bài đã xuất hiện trong lịch sử nộp không đồng nghĩa bài đã được chấm ngay."),
          p("Nếu đã chờ một khoảng thời gian hợp lý mà vẫn chưa có điểm, hãy kiểm tra xem bạn đã dùng đúng mã học viên và đúng tên bài tập hay chưa."),
        ],
      },
    ],
  },
  {
    id: "tra-cuu",
    icon: "🔎",
    title: "Tra cứu hồ sơ và kết quả",
    note: "Điểm số, tiến độ, Linh thạch và vật phẩm",
    filterLabel: "Tra cứu",
    items: [
      {
        question: "Tôi tra cứu hồ sơ học tập bằng cách nào?",
        blocks: [
          p("Mở trang Tra cứu, nhập đúng mã học viên rồi nhấn nút tra cứu. Khi tìm thấy dữ liệu, hệ thống sẽ hiển thị các thông tin đang được ghi nhận cho mã đó."),
          buttons(["MỞ TRANG TRA CỨU", "https://www.thudao.com/p/tra-cuu.html"]),
        ],
      },
      {
        question: "Vì sao hệ thống báo không tìm thấy mã học viên?",
        blocks: [
          p("Một số nguyên nhân thường gặp:"),
          ul(
            "Mã được nhập sai hoặc có khoảng trắng.",
            "Bạn dùng tên hoặc số điện thoại thay cho mã học viên.",
            "Dữ liệu mới chưa đồng bộ xong.",
            "Mã chưa được thêm vào danh sách học viên.",
          ),
          p("Hãy nhập lại mã bằng chữ in hoa và kiểm tra kỹ từng ký tự."),
        ],
      },
      {
        question: "Tại sao điểm hoặc số lượt nộp bài chưa cập nhật ngay?",
        blocks: [
          p("Dữ liệu trên website được tổng hợp từ các bảng dữ liệu học tập. Một số thay đổi cần thời gian để đồng bộ hoặc cần hoàn tất quá trình chấm bài trước khi hiển thị."),
          p("Bạn có thể tải lại trang sau ít phút. Nếu dữ liệu vẫn chưa đúng, hãy gửi thông tin bài nộp cho người phụ trách."),
        ],
      },
      {
        question: "Người khác có thể xem hồ sơ của tôi không?",
        blocks: [
          p("Không nên chia sẻ công khai mã học viên của bạn. Mã này được dùng để tra cứu và liên kết các dữ liệu học tập trong hệ thống."),
          warning("Không đăng ảnh chụp chứa mã học viên, số điện thoại hoặc thông tin cá nhân lên nơi công cộng."),
        ],
      },
    ],
  },
  {
    id: "phan-thuong",
    icon: "💎",
    title: "Linh thạch, vật phẩm và Chợ phiên",
    note: "Cơ chế khích lệ quá trình học tập",
    filterLabel: "Phần thưởng",
    items: [
      {
        question: "Linh thạch là gì?",
        blocks: [
          p("Linh thạch là phần thưởng trong hệ thống học tập. Học viên có thể nhận Linh thạch thông qua quá trình học, nộp bài, kết quả chấm và một số hoạt động hoặc thành tích do thư môn quy định."),
          p("Số Linh thạch hiển thị được tính theo dữ liệu thực tế đã được hệ thống ghi nhận."),
        ],
      },
      {
        question: "Chợ phiên dùng để làm gì?",
        blocks: [
          p("Chợ phiên là nơi học viên xem các thương nhân, vật phẩm hoặc quà tặng đang có và sử dụng số dư phù hợp để thực hiện yêu cầu đổi quà."),
          p("Nội dung Chợ phiên có thể thay đổi theo thời điểm. Hãy đọc kỹ tên vật phẩm, số lượng và chi phí trước khi xác nhận."),
          buttons(["TRA CỨU VÀ MỞ CHỢ PHIÊN", "https://www.thudao.com/p/tra-cuu.html"]),
        ],
      },
      {
        question: "Khi nào một giao dịch đổi quà được tính là thành công?",
        blocks: [
          p("Bạn cần hoàn thành đầy đủ bước xác nhận đổi quà. Sau khi yêu cầu được ghi nhận, dữ liệu giao dịch sẽ được hệ thống xử lý và phản ánh vào hồ sơ."),
          warning("Không đóng trang hoặc gửi lại nhiều lần trong lúc biểu mẫu đang xử lý."),
        ],
      },
      {
        question: "Vì sao số Linh thạch của tôi thay đổi?",
        blocks: [
          p("Số dư có thể thay đổi khi hệ thống ghi nhận thêm kết quả học tập, phần thưởng mới hoặc giao dịch đổi vật phẩm. Một giao dịch hợp lệ có thể làm giảm số dư tương ứng với giá trị đã sử dụng."),
          p("Nếu phát hiện chênh lệch, hãy chụp lại màn hình và cung cấp mã học viên cùng thông tin giao dịch cho người phụ trách."),
        ],
      },
    ],
  },
  {
    id: "ky-thuat",
    icon: "⚙️",
    title: "Lỗi thường gặp",
    note: "Một số cách xử lý nhanh trước khi liên hệ hỗ trợ",
    filterLabel: "Lỗi thường gặp",
    items: [
      {
        question: "Trang tải mãi nhưng chưa hiển thị dữ liệu?",
        blocks: [
          ol(
            "Kiểm tra kết nối Internet.",
            "Chờ khoảng 10–20 giây rồi tải lại trang.",
            "Đóng các tab không cần thiết.",
            "Thử mở bằng Chrome hoặc Safari phiên bản mới.",
            "Tắt chế độ chặn nội dung nếu trình duyệt đang chặn dữ liệu Google.",
          ),
          p("Một số chức năng cần đọc dữ liệu trực tuyến nên sẽ phụ thuộc vào tốc độ mạng và khả năng kết nối tới Google Sheets."),
        ],
      },
      {
        question: "Tôi bấm nút nhưng không có phản hồi?",
        blocks: [
          p("Hãy tải lại trang một lần và chờ các thành phần tải xong trước khi thao tác. Nếu vẫn lỗi, thử mở trang bằng cửa sổ riêng tư hoặc xóa bộ nhớ đệm của trình duyệt."),
          p("Khi báo lỗi, nên gửi kèm:"),
          ul("Đường dẫn trang đang gặp lỗi.", "Ảnh chụp toàn màn hình.", "Thiết bị và trình duyệt đang sử dụng.", "Thời điểm lỗi xảy ra."),
        ],
      },
      {
        question: "Ảnh bài học hoặc ảnh đại diện không hiển thị?",
        blocks: [
          p("Hãy kiểm tra mạng và tải lại trang. Nếu chỉ một ảnh không hiển thị trong khi các phần khác vẫn hoạt động, đường dẫn ảnh có thể đang được cập nhật hoặc quyền truy cập ảnh chưa được mở."),
        ],
      },
      {
        question: "Tôi đã đổi điện thoại hoặc trình duyệt, dữ liệu có mất không?",
        blocks: [
          p("Điểm, lượt nộp bài và các dữ liệu đã được ghi nhận trên hệ thống không phụ thuộc hoàn toàn vào điện thoại. Bạn có thể tra cứu lại bằng đúng mã học viên."),
          p("Tuy nhiên, một số trạng thái tạm thời được lưu trong trình duyệt có thể không xuất hiện trên thiết bị mới."),
        ],
      },
    ],
  },
];
