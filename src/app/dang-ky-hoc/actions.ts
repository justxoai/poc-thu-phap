"use server";

import { findCourse, findPackage, packagesOf } from "@/data/courses";
import { placeCourseRegistration } from "@/lib/firestore/purchases";
import { cleanLine, isEmail, parseVnPhone } from "@/lib/validation";
import { buildVietQrUrl } from "@/lib/vietqr";

export type RegisterField = "name" | "phone" | "email" | "course" | "package" | "agree";

export interface PaymentInstruction {
  bankName: string;
  account: string;
  holder: string;
  amount: number;
  note: string;
  qrUrl: string | null;
}

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string; fields: Partial<Record<RegisterField, string>> }
  | { status: "ok"; name: string; courseName: string; packageName: string; amount: number; duplicate: boolean; payment: PaymentInstruction | null };

const MSG_UNAVAILABLE = "Hệ thống chưa nhận được đăng ký. Vui lòng thử lại sau hoặc gọi 0395 021 559.";

/**
 * Nhận đăng ký khóa học. Chưa tạo tài khoản/mật khẩu: cách đăng nhập chính thức chưa chốt (AGENTS.md).
 * Học phí luôn tra lại từ danh mục khóa/gói ở server. Chưa có giới hạn tần suất/CAPTCHA.
 */
export async function submitRegistrationAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  if (cleanLine(formData.get("website"), 50) !== "") {
    return { status: "ok", name: "", courseName: "", packageName: "", amount: 0, duplicate: false, payment: null };
  }

  const fields: Partial<Record<RegisterField, string>> = {};
  const name = cleanLine(formData.get("name"), 80);
  if (name.length < 2) fields.name = "Vui lòng nhập họ và tên.";
  const phone = parseVnPhone(formData.get("phone"));
  if (!phone) fields.phone = "Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).";
  const email = cleanLine(formData.get("email"), 120);
  if (!isEmail(email)) fields.email = "Email chưa đúng.";
  const zalo = cleanLine(formData.get("zalo"), 80);

  const course = findCourse(cleanLine(formData.get("course"), 40));
  if (!course || !course.open) fields.course = "Vui lòng chọn khoá học đang nhận đăng ký.";
  const pkg = findPackage(cleanLine(formData.get("package"), 40));
  if (course && (!pkg || !packagesOf(course).some((p) => p.id === pkg.id))) fields.package = "Vui lòng chọn gói học của khoá này.";
  if (formData.get("agree") !== "on") fields.agree = "Vui lòng xác nhận đã đọc nội quy lớp học.";

  if (!course || !pkg || !phone || Object.keys(fields).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại các ô được đánh dấu.", fields };
  }

  const result = await placeCourseRegistration({
    name,
    phone,
    email,
    zalo,
    courseId: course.id,
    courseName: course.name,
    packageId: pkg.id,
    packageName: pkg.name,
    amount: pkg.price,
  });
  if (result.status !== "ok") return { status: "error", message: MSG_UNAVAILABLE, fields: {} };

  let payment: PaymentInstruction | null = null;
  const settings = result.data.payment;
  if (settings && pkg.price > 0) {
    const note = [settings.prefix, course.payTag, phone].filter(Boolean).join(" ");
    payment = {
      bankName: settings.bankName,
      account: settings.account,
      holder: settings.holder,
      amount: pkg.price,
      note,
      qrUrl: buildVietQrUrl(settings, pkg.price, note),
    };
  }

  return { status: "ok", name, courseName: course.name, packageName: pkg.name, amount: pkg.price, duplicate: result.data.duplicate, payment };
}
