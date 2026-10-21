import type { Metadata } from "next";

import { ExhibitionGallery } from "@/components/exhibition/ExhibitionGallery";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { getExhibitionMeta, listExhibition } from "@/lib/firestore/exhibition";

import "./exhibition-page.css";

export const metadata: Metadata = {
  title: "Phòng triển lãm",
  description: "Không gian trưng bày những tác phẩm nổi bật được giáo viên chủ nhiệm lựa chọn trong quá trình học tập và rèn luyện.",
};

// Dữ liệu dùng chung: dựng sẵn, làm mới tối đa mỗi 60 giây. Chỉ đọc 24 tác phẩm đầu và một document tổng hợp.
export const revalidate = 60;

export default async function ExhibitionPage() {
  const [first, meta] = await Promise.all([
    listExhibition({ course: null, group: null, sort: "newest", cursor: null }),
    getExhibitionMeta(),
  ]);

  const stats = meta.status === "ok" ? meta.data : null;

  return (
    <SidebarLayout>
      <article className="exp">
        <header className="exp-hero">
          <p className="exp-mark">THANH PHONG THƯ MÔN</p>
          <h1>Phòng triển lãm OCD</h1>
          <p className="exp-lead">Không gian trưng bày những tác phẩm nổi bật được GVCN lựa chọn trong quá trình học tập và rèn luyện.</p>
          {stats ? (
            <dl className="exp-stats">
              <div>
                <dd>{stats.works}</dd>
                <dt>Tác phẩm</dt>
              </div>
              <div>
                <dd>{stats.students}</dd>
                <dt>Học viên</dt>
              </div>
              <div>
                <dd>{stats.groups.length}</dd>
                <dt>Tổ</dt>
              </div>
              <div>
                <dd>{stats.courses.length}</dd>
                <dt>Khóa</dt>
              </div>
            </dl>
          ) : null}
        </header>

        <ExhibitionGallery
          initial={first.status === "ok" ? first.data : { items: [], nextCursor: null }}
          initialStatus={first.status}
          meta={stats}
        />
      </article>
    </SidebarLayout>
  );
}
