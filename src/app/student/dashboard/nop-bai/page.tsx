import type { Metadata } from "next";

import { NeedLogin } from "@/components/student/dashboard/NeedLogin";
import { SubmitWorkForm } from "@/components/student/dashboard/SubmitWorkForm";
import { WorkGrid } from "@/components/works/WorkCard";
import { listStudentWorks } from "@/lib/firestore/homework";
import { HOMEWORK_PER_DAY } from "@/lib/firestore/submissions";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Nộp bài", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SubmitWorkPage() {
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin title="Nộp bài" />;
  const works = await listStudentWorks(viewer.studentId, 12);
  return (
    <>
      <h1 className="page-title">Nộp bài</h1>
      <section className="sd-card" aria-label="Biểu mẫu nộp bài">
        <h2>Nộp bài mới</h2>
        <p>
          Mỗi ngày nộp tối đa {HOMEWORK_PER_DAY} bài. Ảnh vẫn nằm trên Google Drive của bạn; hệ thống chỉ lưu liên kết.
        </p>
        {viewer.group && viewer.course ? (
          <SubmitWorkForm />
        ) : (
          <p className="notice">Thầy chưa xếp Tổ/Khóa cho bạn nên chưa nộp bài được. Vui lòng chờ thầy xếp lớp.</p>
        )}
      </section>
      <section className="sd-card" aria-label="Bài đã nộp gần đây">
        <h2>Bài đã nộp gần đây</h2>
        {works.status === "ok" && works.data.length > 0 ? <WorkGrid works={works.data} /> : null}
        {works.status === "ok" && works.data.length === 0 ? <p className="notice">Bạn chưa nộp bài nào.</p> : null}
        {works.status !== "ok" ? <p className="notice">Chưa đọc được danh sách bài. Vui lòng thử lại sau.</p> : null}
      </section>
    </>
  );
}
