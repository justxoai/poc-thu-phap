/**
 * Ghi lỗi phía server. Chạy `next dev`: in đủ tên, mã (code) và thông điệp để dò lỗi
 * (thông điệp của Firestore/gRPC như "5 NOT_FOUND", "7 PERMISSION_DENIED" không chứa khóa hay dữ liệu cá nhân).
 * Bản chạy thật: chỉ in tên và mã, không in thông điệp.
 */
export function logError(label: string, error: unknown): void {
  if (!(error instanceof Error)) {
    console.error(`[${label}] lỗi: unknown`);
    return;
  }
  const code = (error as { code?: unknown }).code;
  const codeText = typeof code === "string" || typeof code === "number" ? ` code=${code}` : "";
  if (process.env.NODE_ENV === "development") {
    console.error(`[${label}] ${error.name}${codeText}: ${error.message}`);
  } else {
    console.error(`[${label}] ${error.name}${codeText}`);
  }
}
