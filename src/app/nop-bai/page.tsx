import type { Metadata } from "next";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { StudentLookup } from "@/components/student/StudentLookup";
import { WorkGrid } from "@/components/works/WorkCard";
import { listLatestWorks } from "@/lib/firestore/homework";

export const metadata: Metadata = {
  title: "Nộp bài tập",
  description: "Học viên tra cứu hồ sơ, nộp bài tập và xem các tác phẩm mới nhất.",
};

// Dữ liệu dùng chung: dựng sẵn và làm mới tối đa mỗi 60 giây, không đọc Firestore mỗi lượt xem.
export const revalidate = 60;

const LATEST = 10;

export default async function SubmitHomeworkPage() {
  const result = await listLatestWorks(LATEST);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <SidebarLayout>
      <h1 className="page-title">Các học viên nộp bài tập tại đây</h1>

      <StudentLookup
        mode="submit"
        title="Hồ sơ học viên"
        hint="Nhập Mã học viên để mở hồ sơ, nộp bài và xem các bài đã nộp."
      />

      <section className="latest-works" aria-labelledby="latest-works-title">
        <h2 id="latest-works-title" className="page-subtitle">
          Tác phẩm mới nhất
        </h2>
        <p className="page-lead">Những bài tập mới được học viên gửi lên hệ thống.</p>

        {result.status === "unconfigured" ? (
          <p className="notice">
            {isDev
              ? "Chưa kết nối Firestore: thiếu projectId, clientEmail hoặc privateKey trong .env.local (xem README)."
              : "Nội dung đang được cập nhật."}
          </p>
        ) : null}
        {result.status === "error" ? (
          <p className="notice notice-error">Chưa tải được tác phẩm mới nhất. Vui lòng thử lại sau.</p>
        ) : null}
        {result.status === "ok" && result.data.length === 0 ? <p className="notice">Chưa có tác phẩm nào.</p> : null}
        {result.status === "ok" && result.data.length > 0 ? (
          <>
            <p className="latest-works-status">Đang hiển thị {result.data.length} tác phẩm mới nhất.</p>
            <WorkGrid works={result.data} />
          </>
        ) : null}
      </section>
    </SidebarLayout>
  );
}
