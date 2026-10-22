import type { Metadata } from "next";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";
import { QuickCodeForm } from "@/components/student/dashboard/QuickCodeForm";
import { quickLoginAvailable } from "@/lib/firestore/quick-code";
import { QUICK_LOCK_MINUTES, QUICK_MAX_FAILS } from "@/lib/quick-code";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Mã nhanh", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Học viên tự đặt mã nhanh (6 số). Mã của chính người đăng nhập, lấy từ phiên. Mã được băm nên không hiển thị lại. */
export default async function QuickCodePage() {
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin title="Mã nhanh" />;

  if (viewer.role === "admin") {
    return (
      <>
        <h1 className="page-title">Mã nhanh</h1>
        <p className="notice">Tài khoản quản trị chỉ đăng nhập bằng mật khẩu, không dùng mã nhanh.</p>
      </>
    );
  }

  const has = await quickLoginAvailable(viewer.studentId);

  return (
    <>
      <h1 className="page-title">Mã nhanh</h1>
      <section className="sd-card" aria-label="Đặt mã nhanh">
        <h2>Đăng nhập nhanh bằng mã nhanh</h2>
        <p>
          Mã nhanh là dãy 6 chữ số do bạn tự đặt (khác với mã học viên <strong>{viewer.studentId}</strong>). Lần sau, bấm nút Minh Hồng, chọn “Tôi đã có mã học viên”, nhập mã học viên rồi nhập mã nhanh là vào được, không cần mật khẩu.
        </p>
        <p className="qc-status">
          {has.status !== "ok" ? "Chưa đọc được trạng thái mã nhanh." : has.data ? "Bạn đã đặt mã nhanh." : "Bạn chưa đặt mã nhanh."}
        </p>
        {has.status === "ok" ? (
          <QuickCodeForm hasCode={has.data} maxFails={QUICK_MAX_FAILS} lockMinutes={QUICK_LOCK_MINUTES} />
        ) : (
          <p className="notice">Chưa đọc được dữ liệu. Vui lòng thử lại sau.</p>
        )}
      </section>
    </>
  );
}
