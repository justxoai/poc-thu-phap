/** Tạo ảnh VietQR chuyển khoản (dịch vụ img.vietqr.io). Thông tin ngân hàng lấy từ Firestore `settings/payment`, không viết cứng trong mã. */
export interface PaymentSettings {
  bankName: string;
  /** Mã BIN ngân hàng (số). */
  bin: string;
  account: string;
  holder: string;
  /** Tiền tố nội dung chuyển khoản, ví dụ "HOCTHUPHAP". */
  prefix: string;
}

export function buildVietQrUrl(payment: PaymentSettings, amount: number, note: string): string | null {
  if (!/^\d{4,8}$/.test(payment.bin) || !/^\d{6,20}$/.test(payment.account)) return null;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const query = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: note,
    accountName: payment.holder,
  });
  return `https://img.vietqr.io/image/${payment.bin}-${payment.account}-compact2.png?${query.toString()}`;
}
