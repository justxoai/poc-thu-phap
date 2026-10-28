import type { Metadata } from "next";

import { StudentProfileView } from "@/components/student/StudentProfileView";
import { getStudentProfile } from "@/lib/firestore/students";
import { getViewer } from "@/lib/session";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";

import "@/components/student/student.css";

export const metadata: Metadata = {
  title: "Dashboard học viên",
  robots: { index: false, follow: false },
};

// Phụ thuộc người đăng nhập nên luôn dựng theo yêu cầu.
export const dynamic = "force-dynamic";

/**
 * Dashboard học viên (bản POC): chỉ một banner hồ sơ của CHÍNH người đăng nhập. Ví, vật phẩm, bài đã nộp nằm ở các mục riêng trong menu.
 * Mã học viên lấy từ phiên (không nhận từ đường dẫn/tham số) nên không xem được dữ liệu của người khác qua URL.
 * Nộp bài, ví & giao dịch, đơn đã đổi là các trang con (cùng thư mục). Còn thiếu: đổi quà thật ở Chợ phiên.
 * Phiên được ký (HMAC) và hạn 7 ngày; tài khoản mới đăng nhập bằng mật khẩu (xem lib/session.ts).
 */
export default async function StudentDashboardPage() {
  const viewer = await getViewer();

  if (!viewer) return <NeedLogin title="Dashboard học viên" />;

  const profile = await getStudentProfile(viewer.studentId);

  return profile.status === "ok" && profile.data ? (
    <StudentProfileView profile={profile.data} works={[]} showCode bannerOnly />
  ) : (
    <p className="notice">Chưa đọc được hồ sơ. Vui lòng thử lại sau.</p>
  );
}
