"use server";

import { findCourse, findPackage, packagesOf } from "@/data/courses";
import { getOwnContact } from "@/lib/firestore/accounts";
import { placeCourseRegistration } from "@/lib/firestore/purchases";
import { getViewer } from "@/lib/session";
import { cleanLine } from "@/lib/validation";
import { buildVietQrUrl } from "@/lib/vietqr";

export type RegisterField = "course" | "package" | "agree";

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
 * Bước 2 của trang Đăng ký học: nhận đăng ký khóa cho học viên ĐÃ ĐĂNG NHẬP. Họ tên/SĐT/email lấy từ hồ sơ trên server
 * (không nhận từ biểu mẫu nên không đăng ký thay người khác). Học phí luôn tra lại từ danh mục khóa/gói ở server.
 * Chưa có giới hạn tần suất/CAPTCHA (POC-REWIND 4).
 */
export async function enrollCourseAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  if (cleanLine(formData.get("website"), 50) !== "") {
    return { status: "ok", name: "", courseName: "", packageName: "", amount: 0, duplicate: false, payment: null };
  }

  const viewer = await getViewer();
  if (!viewer) return { status: "error", message: "Bạn cần đăng nhập hoặc tạo tài khoản ở Bước 1 trước.", fields: {} };
  const contactResult = await getOwnContact(viewer.studentId);
  if (contactResult.status !== "ok" || !contactResult.data) return { status: "error", message: MSG_UNAVAILABLE, fields: {} };
  const contact = contactResult.data;
  if (!contact.phone || !contact.email) {
    return { status: "error", message: "Tài khoản này chưa có số điện thoại/email. Vui lòng gọi 0395 021 559 để được hỗ trợ đăng ký.", fields: {} };
  }

  const fields: Partial<Record<RegisterField, string>> = {};
  const course = findCourse(cleanLine(formData.get("course"), 40));
  if (!course || !course.open) fields.course = "Vui lòng chọn khoá học đang nhận đăng ký.";
  const pkg = findPackage(cleanLine(formData.get("package"), 40));
  if (course && (!pkg || !packagesOf(course).some((p) => p.id === pkg.id))) fields.package = "Vui lòng chọn gói học của khoá này.";
  if (formData.get("agree") !== "on") fields.agree = "Vui lòng xác nhận đã đọc nội quy lớp học.";

  if (!course || !pkg || Object.keys(fields).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại các ô được đánh dấu.", fields };
  }

  const name = contact.name || viewer.name;
  const phone = contact.phone;
  const result = await placeCourseRegistration({
    studentId: viewer.studentId,
    name,
    phone,
    email: contact.email,
    zalo: contact.zalo,
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
