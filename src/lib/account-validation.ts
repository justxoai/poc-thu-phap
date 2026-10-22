/**
 * Kiểm tra thông tin tạo tài khoản học viên. File thuần (không import server) để DÙNG CHUNG:
 * trình duyệt gọi để báo lỗi ngay khi nhập, server gọi lại để không tin dữ liệu từ trình duyệt.
 */
import { cleanLine, isEmail, parseVnPhone } from "@/lib/validation";

export type AccountField = "name" | "phone" | "email" | "birthDate" | "address" | "zaloName" | "password" | "confirmPassword";
export type AccountErrors = Partial<Record<AccountField, string>>;

/** Dữ liệu đã chuẩn hóa, an toàn để ghi. */
export interface AccountValues {
  name: string;
  /** Dạng 0xxxxxxxxx (10 số). */
  phone: string;
  /** Chữ thường. */
  email: string;
  /** yyyy-mm-dd hoặc "" nếu không nhập. */
  birthDate: string;
  address: string;
  zaloName: string;
  password: string;
}

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 100;
export const MIN_BIRTH_YEAR = 1900;

/** Ngày hôm nay theo giờ Việt Nam, dạng yyyy-mm-dd. */
export function vnToday(now: Date = new Date()): string {
  return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

/** "dd/mm/yyyy" (cho phép d/m/yyyy) -> yyyy-mm-dd. Trả lỗi nếu sai khuôn dạng, ngày không có thật hoặc ở tương lai. */
export function parseBirthDate(raw: string, today: string = vnToday()): { iso: string } | { error: string } {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw.trim());
  if (!m) return { error: "Ngày sinh theo dạng dd/mm/yyyy, ví dụ 15/08/1995." };
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  const real = probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
  if (!real || month < 1 || month > 12 || year < MIN_BIRTH_YEAR) return { error: "Ngày sinh không có thật. Hãy kiểm tra lại." };
  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (iso > today) return { error: "Ngày sinh không được ở tương lai." };
  return { iso };
}

/** Đổi yyyy-mm-dd -> dd/mm/yyyy để hiển thị lại trong ô nhập. */
export function isoToVnDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

type Raw = Record<string, unknown>;
const str = (value: unknown): string => (typeof value === "string" ? value : "");

export type AccountCheck = { ok: true; values: AccountValues } | { ok: false; errors: AccountErrors };

export function validateAccountInput(raw: Raw, today: string = vnToday()): AccountCheck {
  const errors: AccountErrors = {};

  const name = cleanLine(raw.name, 80);
  if (name === "") errors.name = "Vui lòng nhập họ và tên.";
  else if (name.length < 2 || !/\p{L}/u.test(name)) errors.name = "Họ và tên chưa hợp lệ.";

  const phoneRaw = str(raw.phone).trim();
  const phone = parseVnPhone(phoneRaw);
  if (phoneRaw === "") errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!phone) errors.phone = "Số điện thoại gồm 10 số (bắt đầu bằng 0), hoặc dạng +84…";

  const email = str(raw.email).trim().toLowerCase();
  if (email === "") errors.email = "Vui lòng nhập email.";
  else if (!isEmail(email)) errors.email = "Email chưa đúng định dạng, ví dụ ten@gmail.com.";

  let birthDate = "";
  const birthRaw = str(raw.birthDate).trim();
  if (birthRaw !== "") {
    const parsed = parseBirthDate(birthRaw, today);
    if ("error" in parsed) errors.birthDate = parsed.error;
    else birthDate = parsed.iso;
  }

  const address = cleanLine(raw.address, 120);
  const zaloName = cleanLine(raw.zaloName, 60);

  const password = str(raw.password);
  if (password === "") errors.password = "Vui lòng nhập mật khẩu.";
  else if (password.length < PASSWORD_MIN) errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự.`;
  else if (password.length > PASSWORD_MAX) errors.password = `Mật khẩu tối đa ${PASSWORD_MAX} ký tự.`;

  const confirm = str(raw.confirmPassword);
  if (confirm === "") errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
  else if (confirm !== password) errors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors };
  return { ok: true, values: { name, phone, email, birthDate, address, zaloName, password } };
}
