import type { Metadata } from "next";

import { ExhibitionGallery } from "@/components/exhibition/ExhibitionGallery";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { SAMPLE_WORKS, SHOW_SAMPLE_WHEN_EMPTY, sampleMeta } from "@/data/exhibition-sample";
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

  const real = first.status === "ok" ? first.data : { items: [], nextCursor: null };
  // Chưa có tác phẩm thật: hiện bộ MẪU để xem giao diện (tắt bằng SHOW_SAMPLE_WHEN_EMPTY trong data/exhibition-sample.ts).
  const sample = SHOW_SAMPLE_WHEN_EMPTY && real.items.length === 0;
  const stats = sample ? sampleMeta() : meta.status === "ok" ? meta.data : null;

  const cards: { value: number | null; label: string }[] = [
    { value: stats ? stats.works : null, label: "Tác phẩm" },
    { value: stats ? stats.students : null, label: "Học viên" },
    { value: stats ? stats.groups.length : null, label: "Tổ" },
    { value: stats ? stats.courses.length : null, label: "Khóa" },
  ];

  return (
    <SidebarLayout>
      <article className="exp">
        <header className="exp-hero">
          <p className="exp-mark">THANH PHONG THƯ MÔN</p>
          <h1>Phòng triển lãm OCD</h1>
          <p className="exp-lead">Không gian trưng bày những tác phẩm nổi bật được GVCN lựa chọn trong quá trình học tập và rèn luyện.</p>
          <div className="exp-line" aria-hidden="true" />
        </header>

        <ul className="exp-stats" aria-label="Số liệu triển lãm">
          {cards.map((card) => (
            <li key={card.label}>
              <strong>{card.value === null ? "—" : card.value}</strong>
              <span>{card.label}</span>
            </li>
          ))}
        </ul>

        <ExhibitionGallery
          initial={sample ? { items: SAMPLE_WORKS, nextCursor: null } : real}
          initialStatus={sample ? "ok" : first.status}
          meta={stats}
          sample={sample}
        />
      </article>
    </SidebarLayout>
  );
}
