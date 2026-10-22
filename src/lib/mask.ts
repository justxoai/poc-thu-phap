/** Che bớt SĐT/email khi hiển thị lại cho chính chủ (xác nhận "đúng tài khoản của mình" mà không phơi nguyên văn). */

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "";
  return `${digits.slice(0, 3)}${"*".repeat(digits.length - 6)}${digits.slice(-3)}`;
}

export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "";
  const local = email.slice(0, at);
  return `${local.charAt(0)}${"*".repeat(Math.max(2, Math.min(local.length - 1, 6)))}${email.slice(at)}`;
}
