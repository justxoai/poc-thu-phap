# AGENTS.md — Thanh Phong Thư Môn (thudao.com)

Tệp này dành cho AI agent (Claude, Codex, Cursor...) và người mới vào dự án.
Đọc hết trước khi sửa code. Khi học được điều mới, ghi vào `LESSONS_LEARNED.md`.
Mục ghi **[CHƯA CHỐT]** là chưa có quyết định: hỏi chủ dự án, không tự đoán.

> **Trạng thái:** khung dự án mới được dựng, **chưa từng chạy `next build` thật** (môi trường dựng không cài được npm).
> Việc đầu tiên khi nhận dự án: `npm install && npm run typecheck && npm run lint && npm run build`, rồi ghi lỗi (nếu có) vào `LESSONS_LEARNED.md` (L-010).

## 1. Dự án là gì

- Website của Việt Thư Đạo Quán và lớp thư pháp online Thanh Phong Thư Môn.
- Tính năng: tin bài, đăng ký học, nộp bài tập (ảnh), nhiệm vụ và sự kiện, bảng xếp hạng,
  chợ phiên (đổi quà), hộp quà bí ẩn, hỏi đáp (FAQ), tra cứu học viên và cán sự lớp.
- Hiện tại (site cũ): Blogger (template LMS Education) + JS tùy biến đọc Google Sheets / Apps Script / Google Forms.
- Mục tiêu: web app trên Vercel, dữ liệu trong Firestore (project Firebase `poc-thu-phap`).
- Quy mô giả định: ~2.000 học viên, ~100 ảnh bài tập mỗi người (~200.000 ảnh), 3–4 loại tiền/điểm mỗi người.
- Ngôn ngữ giao diện: tiếng Việt. Tên biến, hàm, collection: tiếng Anh.

## 2. Quyết định

| Hạng mục | Quyết định | Trạng thái |
|---|---|---|
| Ngôn ngữ / framework | TypeScript (strict) + Next.js App Router | Đã chốt |
| Hosting | Vercel, vùng hàm `sin1` (xem `vercel.json`). Gói Hobby chỉ dành cho dự án phi thương mại: site có bán hàng nên kiểm tra điều khoản hiện hành, nhiều khả năng cần Pro | Đã chốt (cần kiểm tra gói) |
| Database | Firestore, project `poc-thu-phap` | Đã chốt |
| Firestore Rules | Chặn toàn bộ client (`allow read, write: if false`), file `firestore.rules` | Đã chốt |
| Truy cập DB | Chỉ từ server bằng Firebase Admin SDK (`src/lib/firebase/admin.ts`) | Đã chốt |
| Tên biến môi trường | camelCase đúng như Firebase cấp (`apiKey`, `authDomain`...), đặt trong Vercel Settings, không hardcode | Đã chốt |
| Ảnh bài tập | Tạm giữ **link Google Drive**, Firestore chỉ lưu URL. Drive không phải CDN: có thể bị giới hạn tốc độ khi nhiều người xem. Chuyển sang Storage/R2/Blob khi có thể | Tạm thời |
| Đăng nhập | **Đang ở chế độ POC (Đợt 2)**: Minh Hồng có 4 lối vào; "Đăng nhập" chỉ cần mã học viên hợp lệ, cookie `student_session` = mã học viên (không ký, cookie phiên, không hạn 7 ngày, không mật khẩu); "Tôi có mã học viên" chỉ tra cứu nhanh, không mở phiên; quản trị vẫn là `/dashboard` + `adminAccessKey`. **Hướng làm thật** (đã chọn): mật khẩu thầy cấp, học viên đổi lần đầu; admin = `role=admin`; phiên HMAC hạn 7 ngày; `/dashboard` → `/admin/dashboard`. Mọi chỗ cần làm lại được đánh dấu `POC-REWIND (1|2|3|4)` trong mã nguồn (xem mục 11) | POC (chưa làm thật) |
| Di chuyển dữ liệu từ Google Sheets | Làm **cuối cùng** | **[CHƯA CHỐT]** cách làm |

## 3. Cấu trúc thư mục

```
src/
  app/
    layout.tsx            # KHUNG CHUNG cho mọi trang: TopBar, Header cố định, Footer, nút nổi
    page.tsx              # trang chủ
    hoi-dap/page.tsx      # 25 câu hỏi tĩnh (data/faq.ts) + tìm kiếm/lọc phía client (components/faq)
    sach-thu-phap/        # giới thiệu sách + phiếu mua sách (actions.ts: submitBookOrderAction → purchases kind=book)
    an-trien/             # Đặt làm ấn: nội dung + 8 câu hỏi + phiếu nhiều con ấn (actions.ts: submitSealOrderAction → purchases kind=seal; giá do lib/seal-pricing.ts kiểm tra lại ở server) + bài liên quan nhãn "Ấn triện"
    giang-duong/          # phòng học Hoà Bình (T6)/Hạnh Phúc (T7) 19–21h; liên kết Meet `settings/rooms` chỉ phát cho người đã đăng nhập; "Nhịp sống lớp học" từ lamMoContributions
    tai-lieu/ xem-lai-video/  # video hướng dẫn + tài liệu (khóa theo gói); video xem lại chỉ cho học viên đúng khóa (cần đăng nhập, Đợt 2)
    minh-hong/actions.ts  # Server Actions của Minh Hồng: checkCodeAction (tra nhanh), loginAction (POC: chỉ cần mã), logoutAction
    api/session/route.ts  # trạng thái đăng nhập cho khung Minh Hồng (no-store; không trả mã/SĐT)
    nhiem-vu/ bang-xep-hang/ cho-phien/ mau-lam-mo/  # chỉ đọc: NPC + danh sách nhiệm vụ + kết quả sự kiện; xếp hạng tính sẵn; vật phẩm Chợ phiên; thư viện lâm mô khóa theo điểm
    tin-tuc/ nhan/[label]/ [year]/[month]/[slug]/  # tin tức từ `posts` (ISR), lọc HTML bằng sanitize-html; /năm/tháng/bài.html (Blogger) chuyển 301 về /năm/tháng/bài
    dang-ky-hoc/          # danh mục khóa/gói (data/courses.ts) + phiếu đăng ký (actions.ts → purchases kind=course). KHÔNG có tài khoản/mật khẩu (Đợt 2)
    trien-lam/            # Phòng triển lãm: bài có homework.featured=true, phân trang cursor; API công khai api/trien-lam (CDN 60s)
    components/app/       # AppShell (khung toàn màn hình: menu trái, ngăn kéo trên điện thoại, nút Về trang chủ), AppCenter (đăng nhập/đang đóng), app-shell.css (.ap-*)
    admin/dashboard/      # QUẢN TRỊ /admin/dashboard (noindex, force-dynamic; /dashboard chuyển hướng về đây). XEM: adminAccessKey hoặc pocAdminOpen/next dev. GHI (admin-actions.ts, mọi action qua lib/admin-guard.ts canAdminWrite): chỉ adminAccessKey hoặc next dev. Tab: tổng quan, lớp, học viên, ngọc & ví, chợ phiên, chấm bài, tin tức, mua sách, đặt ấn, khóa học, tài liệu
    student/dashboard/    # DASHBOARD HỌC VIÊN (noindex, force-dynamic, layout có menu): tổng quan, nop-bai (dán link Drive), vi (số dư 6 loại ngọc + sổ cái), don-hang. Mã học viên LUÔN lấy từ cookie phiên, không từ URL/biểu mẫu
    gioi-thieu/           # page.tsx (tĩnh) + about.css (CSS riêng, mọi selector bắt đầu bằng .about)
    huong-dan/            # page.tsx (tĩnh) + guide.css (.guide-*); nội dung ở data/guide.ts
    nop-bai/page.tsx      # tra mã học viên + "Tác phẩm mới nhất" (ISR 60s). CHƯA nhận nộp bài thật
    tra-cuu/actions.ts    # Server Actions: lookupStudentAction, lookupClassAction
    tra-cuu/hoc-vien/     # hồ sơ học viên (+ khung Chợ phiên chỉ là liên kết sang trang cũ)
    tra-cuu/can-su-lop/   # tra cứu theo mã lớp (cán sự)
    api/health/route.ts   # báo đã đủ biến môi trường chưa (không đọc Firestore)
    api/trien-lam/route.ts # JSON triển lãm (không có điểm/nhận xét/mã học viên)
    globals.css
  components/
    shell/                # TopBar, Header, NavMenu(client), Footer, FollowUs, FloatingAssistant(client),
                          # Sidebar + SidebarLayout (nội dung + thanh bên 300px cho các trang con)
    faq/ book/ register/ exhibition/ dashboard/   # FaqExplorer; BookOrderForm; RegisterForm; ExhibitionGallery; AdminLogin + views
    DriveImage.tsx        # ảnh Drive (thumbnail, unoptimized)
    student/ class/ works/ guide/   # StudentLookup/ProfileView/MarketPanel, ClassLookup/ClassResult, WorkCard/WorkGrid, ZoomFigure
    RichText.tsx          # **đậm** và [nhãn](url); link trang cũ thudao.com/p/*.html tự đổi sang đường dẫn mới (lib/links.ts)
    home/                 # Hero, ServiceBlocks, LatestPosts, PortalSection
    shell/assistant.css   # nội dung khung Minh Hồng
    library/ posts/ seal/  # VideoList + library.css; PostCard + posts.css; SealOrderForm (client)
  config/site.ts          # liên hệ, menu, lối vào (không còn trang giữ chỗ: mọi trang trên trang chủ đã có route)
  data/posts.ts           # bài viết mẫu (tạm; bài thật vẫn ở Blogger)
  data/topics.ts          # chủ đề + số bài của thanh bên (tĩnh, sẽ cũ dần)
  data/guide.ts           # nội dung trang Hướng dẫn (video YouTube nhúng tĩnh)
  data/seal.ts npcs.ts lecture.ts gems.ts labels.ts  # nội dung Đặt ấn, nhân vật/NPC, lịch phòng học, loại ngọc + cấp bậc, chủ đề bài viết
  data/faq.ts book.ts courses.ts   # nội dung Hỏi đáp, Sách (giá ở lib/book-pricing.ts), danh mục khóa học + học phí (nguồn duy nhất để tính tiền)
  data/about.ts           # nội dung trang Giới thiệu; data/about-images.ts: ảnh (đang hotlink Blogger)
  lib/
    firebase/config.ts    # đọc biến môi trường (server-only)
    firebase/admin.ts     # khởi tạo Admin SDK muộn (build không cần key)
    firestore/            # hàm truy vấn theo từng collection
    activity.ts drive.ts format.ts links.ts   # quy tắc hoạt động 21 ngày, link ảnh Drive, ngày giờ VN, đổi link cũ→mới
    firestore/run.ts homework.ts students.ts  # truy vấn có limit; trả DataResult (ok|unconfigured|error)
    book-pricing.ts vietqr.ts validation.ts text.ts faq-filter.ts exhibition-rule.ts admin-auth.ts   # giá sách, mã QR VietQR, kiểm tra form, chuẩn hóa tiếng Việt, lọc FAQ, luật vào triển lãm, phiên quản trị (cookie ký HMAC)
    firestore/purchases.ts exhibition.ts cursor.ts admin-data.ts   # ghi đơn (create idempotent), triển lãm, cursor chung, truy vấn Dashboard (luôn có limit)
    session.ts            # getViewer() đọc cookie + students/{mã}; KHÔNG gọi trong layout gốc (sẽ làm mọi trang thành động)
    firestore/viewer.ts   # đọc student cho phân quyền (chỉ trường cần thiết)
    seal-pricing.ts ranking.ts cache.ts session.ts post-id.ts sanitize-post.ts relative-time.ts youtube.ts   # giá ấn + kiểm tra phiếu; xếp hạng thuần; bộ nhớ đệm TTL; người xem (stub); id bài viết; lọc HTML; thời gian tương đối; YouTube
    firestore/rankings.ts market.ts lam-mo.ts videos.ts documents.ts lecture.ts quests.ts posts.ts   # đọc dữ liệu các trang Đợt 1
    wallet.ts             # MỌI thay đổi số dư đi qua changeBalance()
    types.ts
  styles/tokens.css       # biến màu, font
public/images/            # ảnh thương hiệu lấy từ site cũ
```

Link cũ `thudao.com/p/<tên>.html` được đổi sang route mới bằng `lib/links.ts` (trong nội dung) và `redirects()` trong `next.config.ts` (truy cập trực tiếp).
Trang cần giao diện riêng (nhiệm vụ, bảng xếp hạng, chợ phiên, nộp bài...) chỉ thay nội dung trong `<main>`; nếu cần bỏ Header/Footer thì tách route group `(app)` rồi chuyển layout xuống.

## 4. Giao diện

Khung chung (mọi trang): TopBar liên hệ + mạng xã hội, Header dính đầu trang (logo, menu, "Tra cứu" có menu con), Footer 3 cột (giới thiệu, nổi bật, theo dõi + huy hiệu Bộ Công Thương), nút trợ lý nổi "Minh Hồng" (4 lối vào: có mã học viên / đăng nhập / tạo tài khoản / người mới; đăng nhập đang ở chế độ POC, xem mục 11).

Trang chủ: Hero (banner thủy mặc), 6 lối vào dịch vụ, Bài đăng mới (1 nổi bật + 4), khu "Học online miễn phí" (5 thẻ tròn).

Màu và font nằm ở `src/styles/tokens.css` (nền giấy `#f7f1e6`, chữ `#29241f`, vàng `#d5aa58`/`#b58440`, xanh đậm `#263f4b`, nâu đất `#5a3d29`).
Font: site cũ khai báo Rubik nhưng không tải; dùng font hệ thống + Georgia cho tiêu đề (hỗ trợ tiếng Việt đầy đủ).

**Giấy phép:** template Blogger cũ là LMS Education (BTemplates), CC BY-NC-ND 4.0 (phi thương mại, không phái sinh).
**Không sao chép HTML/CSS của template.** Code giao diện ở đây được viết mới theo bố cục và bảng màu của chủ dự án.

## 5. Mô hình dữ liệu Firestore (giả định, cần xác nhận)

Collections: `students`, `homework`, `classCodes`, `events`, `quests`, `questProgress`, `market`, `orders`, `transactions`, `purchases`, `settings`, `meta`, `rankings`, `videos`, `documents`, `lamMo`, `lamMoContributions`, `posts`. (FAQ nay là dữ liệu tĩnh `data/faq.ts`, không còn collection `faq`.)

- `students/{id}` (mã học viên = document ID): `name`, `group` (tổ), `course` (khóa), `paid?` (boolean, đặt tay khi học viên mua gói trả phí; mở video/tài liệu trả phí), `role?` (chưa dùng; POC-REWIND 3), `wallet: { [loạiTiền]: số nguyên }`,
  `inventory: { [vậtPhẩm]: số lượng }`, `stats: { submissionCount, gradedCount, scoreSum, lastSubmittedAt }` (tính sẵn, cập nhật khi có/chấm bài),
  `updatedAt`. Điện thoại/email/địa chỉ/ngày sinh **không bao giờ được đọc** bởi code trang công khai (`mapStudent` chỉ lấy trường an toàn).
- `homework/{id}`: `studentId`, `studentName`, `group`, `course`, `driveFileId`, `description`, `score` (số|null), `comment`, `submittedAt`; **Đợt 3 thêm** `graded` (bool, bài do site mới nộp có `false`; dữ liệu cũ không có trường này nên chấm bài không lọc theo `graded`), `gradedAt`. Id = hash(studentId + driveFileId) (nộp lại cùng ảnh không tạo bài mới). Nộp bài cập nhật `students.stats.submissionCount/lastSubmittedAt` trong cùng transaction; chấm bài cập nhật `stats.gradedCount/scoreSum` (chấm lại chỉ cộng phần chênh). Giới hạn 10 bài/học viên/ngày (giờ VN).
  Index composite (xem `firestore.indexes.json`, **cần deploy**: `firebase deploy --only firestore:indexes`, chưa chạy được thử):
  `studentId + submittedAt desc`; `group + course + submittedAt desc`; `featured + submittedAt desc` và 3 biến thể thêm `course`, `group`, `course + group` (Triển lãm); `purchases: kind + createdAt desc`; `videos: kind + order`; `posts: status + publishedAt desc` và `status + labels(array-contains) + publishedAt desc`. Tắt index các trường lớn/không query của homework, purchases, posts, lamMo, videos, documents, quests (xem file). Tổng 10 index + 23 field override.
- `homework.featured: true` chỉ đặt cho bài vào Triển lãm. Luật (`exhibition-rule.ts`, suy từ site cũ, **cần xác nhận**): nhận xét của GVCN có từ riêng "ngon" (không phân biệt dấu/hoa thường), mô tả không chứa "bói biểu"/"thu hoạch"/"lý thuyết". Site cũ còn nguồn `noteText` chưa rõ. Người/quy trình chấm bài phải đặt cờ này khi migrate/chấm.
- `purchases/{id}` — đơn **tiền thật** (mua sách, đăng ký khóa, mua tài liệu): `kind` (book|course|document|seal), `name`, `phone`, `email?`, `address?`, `zalo?`, `item`, `package?`, `quantity`, `promoCode?`, `discount` (student|early|none), `unitPrice`, `total`, `status` (new|confirmed|paid|shipped|done|cancelled), `createdAt`. Giá luôn do server tính lại (sách: `book-pricing.ts`; khóa: `data/courses.ts`). ID xác định: sách = hash(SĐT, số lượng, địa chỉ, khung 10 phút); khóa = SĐT+khóa+gói (gửi lại = trùng). Dữ liệu cá nhân chỉ hiện ở Dashboard.
- `orders/{id}` — đơn **Chợ phiên** (đổi quà bằng linh thạch; **Đợt 3:** thầy đổi `status` new→confirmed→shipped→done, CHƯA có hủy/hoàn ngọc; index mới `studentId + createdAt desc`): `studentId`, `studentName`, `itemName`, `quantity`, `cost`, `currency`, `status`, `createdAt`. Khác với `purchases`.
- Đơn đặt ấn (`purchases` kind=`seal`): thêm `items[]` ({type danh|nhan, size s1..s4, stone thuong|tot|dep|cucdep, unitPrice, quantity, content, extra, design, total}), `note`, `item` (tóm tắt nhiều dòng), `quantity` = tổng số ấn. Giá từ `lib/seal-pricing.ts`: đá thường 900.000đ, đá tốt 1.200.000đ, đá đẹp 1.5–2 triệu (khách chọn trong khoảng), cực đẹp từ 2 triệu (trần 50 triệu), thiết kế +300.000đ/mẫu (không nhân số lượng). Tối đa 10 ấn/đơn, 20 cái/ấn. Phiếu chỉ cho khách (không điền sẵn từ hồ sơ học viên, tránh lộ SĐT/địa chỉ).
- `market/{id}` (**Đợt 3:** thầy thêm/sửa được; `currency` là TÊN ngọc ("Hồng Ngọc"), `rarity` là mã, nhập kho chỉ cho vật phẩm có số `stock`, `updatedAt`, `createdAt`): `name`, `description?`, `price`, `currency` (mặc định "Hồng Ngọc"), `rarity` (phoThong|trungPham|trungThuongPham|thuongPham|caoCap|cucPham), `stock`, `imageId?` (Drive), `active`. Nhãn `[GEM:...]` trong mô tả cũ bị lược khi hiển thị.
- `rankings/{khóa}`: `{ students: [{ name, group, course, submissions, graded, scoreSum, longestStreak, wealth }], updatedAt }` do quy trình tính định kỳ ghi (chưa có; Đợt 3 làm nút tính lại). Không chứa mã học viên. Trang đọc tối đa 20 document, cache 60 giây. Rank = số bài hợp lệ + tổng điểm; `wealth` quy ra Hoàng Ngọc (`data/gems.ts`).
- `videos/{id}`: `kind` (guide|replay), `lesson`, `title`, `description`, `difficulty`, `paid`, `youtubeId`, `course` ("all" | "3" | "1,2"), `order`, `active`. `documents/{id}`: `title`, `description`, `mark`, `href` (https), `access` (public|student|paid), `order`. Mã video/`href` bị khóa KHÔNG được gửi xuống trình duyệt.
- `lamMo/{id}`: `content`, `author`, `contentAuthor`, `charCount`, `topic`, `shortDesc`, `imageId`, `videoUrl`, `unlockPoint` (điểm xếp hạng cần để mở), `week`, `createdAt`, `active`; bài chưa đủ điểm bị lược ảnh/video/mô tả ở server. `lamMoContributions/{id}`: `title`, `authorName`, `group`, `course`, `hearts`, `lamMoId?`, `approved`, `createdAt`.
- `quests/{id}`: `order`, `title`, `description`, `level`, `rewardAmount`, `rewardGem`, `active` (chỉ danh sách; bước/tiến độ/NPC tương tác thuộc Đợt 3). `events/beast`: `{ dateLabel, teams[{team, finished, correct, score}] (top 3), rulesHref? }`. `settings/rooms`: `{ "hoa-binh": "https://meet...", "hanh-phuc": "https://meet..." }`.
- `posts/{yyyy-mm_slug}`: `title`, `summary`, `thumbnail` (mã Drive hoặc https), `labels[]`, `publishedAt`, `html`, `status` (published|draft). Danh sách chỉ đọc trường nhẹ; `html` qua `sanitize-html` (allowlist; `<style>` được giữ vì bài cũ cần, chưa giới hạn phạm vi nên chỉ dùng cho nội dung do chủ site soạn).
- `settings/bookSale`: `{ earlyBirdLimit }` (số đơn đăng ký sớm tối đa; 0 hoặc thiếu = tắt, mọi người mua giá bìa 380.000đ; sớm 342.000đ; mã học viên hợp lệ 304.000đ).
- `settings/payment`: `{ bankName, bin, account, holder, prefix? }` để sinh mã VietQR cho đăng ký khóa; thiếu thì không hiện hướng dẫn chuyển khoản. Nội dung CK: `HOCTHUPHAP <khóa> <SĐT>` (có thể đổi `prefix`).
- `meta/exhibition`: `{ works, students, groups[], courses[] }` thống kê/bộ lọc tính sẵn cho Triển lãm (cập nhật khi đặt `featured`).
- `classCodes/{MÃ}`: `group`, `course`. Mã tra cứu của cán sự do chủ dự án cấp (không đoán được), thay cho mã cũ theo công thức.
- `transactions/{id}` (sổ cái, **không sửa/xóa**; **Đợt 3:** nguồn `teacher_gift` (thầy tặng, chỉ cộng) và `admin_adjust` (điều chỉnh, bắt buộc có lý do) do khu thầy ghi qua `lib/wallet.ts`; khóa ví dùng lại khóa đang có (tên hoặc mã ngọc), mới thì dùng mã ngọc như `hongNgoc`; index mới: `studentId + createdAt desc`): `studentId`, `currency`, `amount` (±), `balanceAfter`, `source`, `refId`, `note`, `createdAt`.

Quy tắc:
- **Không lưu ảnh (base64) trong Firestore** (giới hạn 1 MiB/document). Chỉ lưu URL/path.
- **Tiền/điểm:** chỉ đổi qua `changeBalance()` (`src/lib/wallet.ts`): một transaction vừa cập nhật số dư vừa ghi sổ cái;
  từ chối nếu số dư âm; có `idempotencyKey` (ví dụ `quest:{questId}:{studentId}`, `order:{orderId}`) để không cộng/trừ hai lần.
  Mọi nguồn (học tập, nhiệm vụ, sự kiện, chợ phiên, hộp bí ẩn, GVCN tặng, chỉnh tay) đều đi qua hàm này.
- **Chợ phiên ⇒ có lịch sử giao dịch.** Mỗi lần đổi quà tạo: `orders/{orderId}` + trừ `market/{item}.stock` + trừ ví + 1 dòng `transactions` (`source: "market"`, `refId: orderId`).
  **TODO khi làm chợ phiên:** `changeBalance()` hiện tự mở transaction; cần thêm biến thể nhận transaction có sẵn để gộp tất cả vào một transaction duy nhất.
- **Index:** tắt index tự động (single-field exemption) cho trường lớn hoặc không bao giờ query (`answer`, `comment`, `imageUrl`, `avatar`...). Ước tính index chiếm ~80% dung lượng.
- Quy tắc "hoạt động": quá 21 ngày kể từ bài hợp lệ gần nhất là cảnh báo (`lib/activity.ts`). "Bài hợp lệ", điểm trung bình = scoreSum/gradedCount.
- Không đọc cả collection: luôn `limit()` và phân trang bằng cursor. Không dùng ID tuần tự cho dữ liệu ghi nhiều.
- Bảng xếp hạng: tính sẵn và cache. Dữ liệu cũ (sổ cái, tiến độ nhiệm vụ, ảnh hết kỳ) cần chính sách gộp/xóa.

**[CHƯA CHỐT] thêm (đợt Hỏi đáp/Sách/Đăng ký/Triển lãm/Dashboard):** (6) đăng ký khóa học thật sự cần tài khoản + mật khẩu + xác minh email như site cũ hay chỉ phiếu đăng ký; (7) Dashboard: `adminAccessKey` chỉ là cơ chế tạm cho một người, cần đăng nhập thật + phân quyền; (8) chống spam/CAPTCHA/rate limit cho 2 form (hiện chỉ có ô bẫy `website`); (9) "Mua tài liệu" chưa có luồng mua nào ở site cũ: nguồn đơn `kind=document` chưa có; (10) [đã xử lý] "Đặt làm ấn" nay có trang riêng `/an-trien`; (11) ngữ nghĩa "đăng ký sớm" (`earlyBirdLimit`) khác site cũ; (12) luật vào Triển lãm (xem `homework.featured`); (13) thông tin ngân hàng đặt ở `settings/payment`.

**[CHƯA CHỐT] cần hỏi chủ dự án:** (1) tra cứu chỉ bằng mã học viên — ai biết mã là xem được hồ sơ, cần cơ chế đăng nhập;
(2) chống dò mã/rate limit cho Server Actions (cần hạ tầng, chưa làm); (3) định nghĩa "bài hợp lệ" và "điểm xếp hạng";
(4) nộp bài thật (nơi lưu ảnh), Chợ phiên, tặng quà của GVCN; (5) cách nhập dữ liệu cũ từ Google Sheets (chưa migrate: các trang hiện hiện trạng thái trống).

## 6. Biến môi trường

Đặt trong `.env.local` (máy cá nhân, đã gitignore) và Vercel → Settings → Environment Variables. **Đúng tên camelCase**:

```
# Cấu hình web (không bí mật)
apiKey  authDomain  projectId  storageBucket  messagingSenderId  appId  measurementId
# Service account (BÍ MẬT, bật "Sensitive" trên Vercel)
clientEmail  privateKey
# Khóa vào /admin/dashboard (BÍ MẬT, tối thiểu 12 ký tự; thiếu hoặc ngắn thì Dashboard đóng hoàn toàn)
adminAccessKey
# POC (tùy chọn): pocAdminOpen=true cho XEM /admin/dashboard không cần khóa (KHÔNG cho ghi). Chỉ dùng khi thử với dữ liệu giả; xem mục 11
pocAdminOpen
```
- `privateKey`: giữ nguyên chuỗi có `\n`, code tự đổi thành xuống dòng thật.
- Các biến này **chỉ đọc được ở server**. Khi cần client (đăng nhập sau này), đọc bằng `getFirebaseWebConfig()` trong Server Component rồi truyền qua props.
  Không thêm tiền tố `NEXT_PUBLIC_` và không đưa `clientEmail`/`privateKey` vào `next.config.ts`.
- `.env.example` chỉ chứa tên biến. Không commit `.env*` (trừ `.env.example`) hay file JSON service account.
- Chỉ có cấu hình web thì chưa đọc được Firestore: Rules chặn client, nên **bắt buộc có service account** (`clientEmail`, `privateKey`).

## 7. Quy tắc an toàn

- Dữ liệu cá nhân học viên (họ tên, số điện thoại, email, địa chỉ, ngày sinh) chỉ đọc ở server, không đưa vào trang công khai, URL, query string hay log.
- Không commit key/token/service account. Nếu lộ: thu hồi và tạo key mới ngay.
- Mọi Route Handler/Server Action kiểm tra quyền (học viên chỉ thấy dữ liệu của mình; cán sự lớp theo lớp). Chưa có đăng nhập nên chưa được mở API ghi dữ liệu ra công khai.
- Không để Google Sheets "xuất bản lên web" chứa dữ liệu cá nhân (site cũ đang dùng kiểu này).
- Đặt Budget alert trên Google Cloud/Firebase và giới hạn chi tiêu trên Vercel trước khi mở cho học viên.
- `/api/health` chỉ báo tên biến còn thiếu, không bao giờ in giá trị.

## 8. Hiệu năng và chịu tải

- Trang công khai: tĩnh hoặc ISR (`export const revalidate`), phục vụ từ CDN, không chạm Firestore mỗi lượt xem.
- Chỉ trang cá nhân hóa mới gọi Firestore; cache có thời hạn cho dữ liệu dùng chung (bảng xếp hạng, chợ phiên).
- Tránh `onSnapshot` cho dữ liệu công khai. Ảnh: nén, thumbnail, cache lâu; chú ý băng thông.
- Code dùng `firebase-admin` chạy Node runtime (không Edge). Hàm Vercel ở `sin1`, cùng vùng Firestore (kiểm tra location khi tạo database, không đổi được sau này).

## 9. Cách agent làm việc ở đây

1. Đọc `AGENTS.md` và `LESSONS_LEARNED.md` trước khi bắt đầu.
2. Việc chạm dữ liệu, tiền/điểm, bảo mật: nêu kế hoạch ngắn trước khi sửa.
3. Không đoán mục **[CHƯA CHỐT]**: hỏi.
4. Đổi schema Firestore: cập nhật mục 5.
5. Sau khi sửa: chạy lint, typecheck, build và báo kết quả thật; nếu không chạy được, nói rõ là chưa kiểm tra.
6. Gặp lỗi hoặc phát hiện đáng nhớ: thêm một dòng vào `LESSONS_LEARNED.md`.
7. Trả lời bằng tiếng Việt, ngắn gọn, nêu rõ phần nào là giả định.
8. Không commit/push trừ khi được yêu cầu.

## 10. Lệnh

```
install:    npm install
dev:        npm run dev          # http://localhost:3000
lint:       npm run lint
typecheck:  npm run typecheck
build:      npm run build
start:      npm run start
health:     GET /api/health      # kiểm tra đủ biến môi trường
```

**[CHƯA CHỐT] thêm (Đợt 1: Giảng đường, Nhiệm vụ, Xếp hạng, Chợ phiên, Lâm mô, Tài liệu, Đặt ấn, Tin tức):** (14) bảng xếp hạng công khai hiện **họ tên đầy đủ** như site cũ, trong khi mục 7 coi họ tên là dữ liệu cá nhân: giữ, rút gọn (tên + chữ cái họ) hay chỉ hiện cho người đã đăng nhập?; (15) tên/đơn vị tài sản trong ví ("Linh thạch" chung hay 6 loại ngọc quy đổi?): `data/gems.ts` đang giả định hệ ngọc của site cũ; (16) di chuyển bài viết từ Blogger sang `posts` (feed Blogger hay xuất tay) và có tin tưởng HTML cũ không; (17) quy trình tính `rankings` định kỳ; (18) trang Search: làm sau bằng chỉ mục JSON tĩnh (tiêu đề, nhãn, tóm tắt) khi `posts` đã có dữ liệu; (19) Đợt 2 (tài khoản, phiên 7 ngày, Minh Hồng) và Đợt 3 (`/student/dashboard`, `/admin/dashboard`, engine nhiệm vụ, đổi quà thật, cập nhật tin) chưa làm.

## 11. Chế độ POC: những gì cần làm lại cho bản thật

Tìm `POC-REWIND` trong `src/` để thấy từng chỗ. Tóm tắt:
1. **Cookie phiên** (`lib/session.ts`): hiện cookie `student_session` = mã học viên, không ký, hết khi đóng trình duyệt. Thật: giá trị `<hết hạn>.<HMAC>` (mẫu ở `lib/admin-auth.ts`), `maxAge` 7 ngày, kiểm tra khi đọc. Hậu quả hiện tại: biết mã của người khác là vào được như họ.
2. **Mật khẩu** (`app/minh-hong/actions.ts` `loginAction`, `components/shell/FloatingAssistant.tsx`): hiện không có. Thật: `students/{id}.passwordHash` (scrypt + salt), `mustChangePassword`, trang đổi mật khẩu, lỗi chung "Mã hoặc mật khẩu không đúng", làm chậm khi sai.
3. **Quản trị**: Minh Hồng luôn hiện 2 nút cho mọi người: "Dashboard của thầy" (→ `/dashboard`) và "Dashboard học viên" (→ `/student/dashboard`). `/admin/dashboard` XEM được khi có `adminAccessKey` (đăng nhập) HOẶC `pocAdminOpen=true` HOẶC chạy `next dev` (`isPocAdminOpen()`); GHI chỉ khi đăng nhập bằng `adminAccessKey` HOẶC `next dev` (`canAdminWrite()` trong `lib/admin-guard.ts`), vì `pocAdminOpen` công khai mà cho ghi thì ai cũng cộng được ngọc. Thật: xóa `isPocAdminOpen`, `role=admin`, nút thầy chỉ hiện cho admin, nút học viên chỉ hiện khi đã đăng nhập, `/admin/dashboard`. **Cảnh báo:** trang quản trị chứa SĐT/địa chỉ/email khách, không bật `pocAdminOpen` trên bản chạy công khai có dữ liệu thật.
4. **Chống dò mã**: chưa có rate limit/CAPTCHA (cũng áp dụng cho trang tra cứu và 2 form).
Đã làm ở Đợt 3: khu học viên (nộp bài, ví & giao dịch, đơn đã đổi) và khu thầy (cộng/trừ ngọc, chợ phiên, chấm bài, tin tức; quyền GHI chặt hơn quyền XEM). Chưa làm: **engine nhiệm vụ** (nhận/hoàn thành/thưởng), **đổi quà thật** ở Chợ phiên (trừ ngọc + kho + đơn + sổ cái trong một transaction), hộp quà bí ẩn, hủy đơn/hoàn ngọc, tính `rankings`, nhập tin từ Blogger, kiểm tra thật `next build`/ESLint.
