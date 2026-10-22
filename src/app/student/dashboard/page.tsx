import type { Metadata } from "next";
import Link from "next/link";

import { StudentProfileView } from "@/components/student/StudentProfileView";
import { listStudentWorks } from "@/lib/firestore/homework";
import { quickLoginAvailable } from "@/lib/firestore/quick-code";
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
 * Phiên được ký (HMAC) và hạn 7 ngày; tài khoản mới đăng nhập bằng mật khẩu (xem lib/session.ts).
 */
export default async function StudentDashboardPage() {
  const viewer = await getViewer();

  if (!viewer) return <NeedLogin title="Dashboard học viên" />;

  const [profile, works, quick] = await Promise.all([getStudentProfile(viewer.studentId), listStudentWorks(viewer.studentId, 50), quickLoginAvailable(viewer.studentId)]);

  return (
    <>
      <h1 className="page-title">Dashboard của {viewer.name || "học viên"}</h1>
      {quick.status === "ok" && !quick.data && viewer.role !== "admin" ? (
        <p className="notice">
          Bạn chưa đặt <strong>mã nhanh</strong> (6 chữ số) để đăng nhập nhanh qua Minh Hồng. <Link href="/student/dashboard/ma-nhanh">Đặt mã nhanh</Link>
        </p>
      ) : null}
      {profile.status === "ok" && profile.data ? (
        <StudentProfileView profile={profile.data} works={works.status === "ok" ? works.data : []} showCode />
      ) : (
        <p className="notice">Chưa đọc được hồ sơ. Vui lòng thử lại sau.</p>
      )}
      {works.status === "error" ? <p className="notice">Chưa đọc được danh sách bài đã nộp.</p> : null}
    </>
  );
}
