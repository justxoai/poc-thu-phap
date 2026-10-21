import type { Metadata } from "next";

import { StudentProfileView } from "@/components/student/StudentProfileView";
import { listStudentWorks } from "@/lib/firestore/homework";
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
 * Dashboard học viên (bản POC): hồ sơ, ví, vật phẩm đang có và các bài đã nộp của CHÍNH người đăng nhập.
 * Mã học viên lấy từ phiên (không nhận từ đường dẫn/tham số) nên không xem được dữ liệu của người khác qua URL.
 * Nộp bài, ví & giao dịch, đơn đã đổi là các trang con (cùng thư mục). Còn thiếu: đổi quà thật ở Chợ phiên.
 * POC-REWIND (1)(2): phiên hiện chỉ cần mã học viên; khi làm thật trang này mới thực sự được bảo vệ bằng mật khẩu.
 */
export default async function StudentDashboardPage() {
  const viewer = await getViewer();

  if (!viewer) return <NeedLogin title="Dashboard học viên" />;

  const [profile, works] = await Promise.all([getStudentProfile(viewer.studentId), listStudentWorks(viewer.studentId, 50)]);

  return (
    <>
      <h1 className="page-title">Dashboard của {viewer.name || "học viên"}</h1>
      {profile.status === "ok" && profile.data ? (
        <StudentProfileView profile={profile.data} works={works.status === "ok" ? works.data : []} />
      ) : (
        <p className="notice">Chưa đọc được hồ sơ. Vui lòng thử lại sau.</p>
      )}
      {works.status === "error" ? <p className="notice">Chưa đọc được danh sách bài đã nộp.</p> : null}
    </>
  );
}
