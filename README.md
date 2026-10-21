# poc-thu-phap

Web app cho Thanh Phong Thư Môn (thudao.com): Next.js (TypeScript) trên Vercel, dữ liệu Firestore.
Đọc `AGENTS.md` trước khi sửa code và ghi bài học vào `LESSONS_LEARNED.md`.

> Khung dự án này chưa được `next build` thật (xem L-010). Hãy chạy các lệnh bên dưới và báo lỗi nếu có.

## Chạy trên máy

Cần Node.js 20.9 trở lên.

```bash
npm install
npm run typecheck
npm run lint
npm run dev        # http://localhost:3000
```

`.env.local` đã có cấu hình web của Firebase. Để đọc được Firestore, điền thêm `clientEmail` và `privateKey` (xem bên dưới).
Mở `http://localhost:3000/api/health` để kiểm tra đã đủ biến chưa.

## Biến môi trường (đúng tên camelCase)

| Biến | Loại | Lấy ở đâu |
|---|---|---|
| `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` | Công khai | Firebase Console → Project settings → General → Your apps → cấu hình web |
| `clientEmail`, `privateKey` | **Bí mật** | Firebase Console → Project settings → Service accounts → Generate new private key (trường `client_email`, `private_key` trong file JSON) |

Lưu ý:
- Đặt `privateKey` trong dấu nháy kép, giữ nguyên các ký tự `\n`.
- Xóa file JSON service account sau khi chép xong. Không commit, không gửi qua chat.
- Chỉ có cấu hình web thì **chưa đọc được Firestore** vì Rules chặn toàn bộ client; cần service account.

## Triển khai lên Vercel

1. Đưa repo lên GitHub, import vào Vercel (tự nhận Next.js).
2. Project → Settings → Environment Variables: thêm các biến ở bảng trên, đúng tên. Bật **Sensitive** cho `clientEmail`, `privateKey`.
3. Deploy. Hàm chạy ở Singapore (`sin1`) theo `vercel.json`.
4. Đặt Budget alert trên Google Cloud và giới hạn chi tiêu trên Vercel.
5. Gói Hobby của Vercel chỉ dành cho dự án phi thương mại; site có bán hàng nên kiểm tra điều khoản hiện hành.

## Firestore Rules

Rules nằm ở `firestore.rules` (chặn toàn bộ client). Dán vào Firebase Console → Firestore → Rules, hoặc triển khai bằng Firebase CLI.

## Thử nhanh Firestore

Tạo collection `faq` trong Firebase Console, mỗi document có `question` (chuỗi), `answer` (chuỗi) và `order` (số). Mở `/hoi-dap` để xem.
