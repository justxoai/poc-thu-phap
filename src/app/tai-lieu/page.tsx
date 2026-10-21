import type { Metadata } from "next";
import Link from "next/link";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { VideoList, VideoPlayer } from "@/components/library/VideoList";
import { listDocuments } from "@/lib/firestore/documents";
import { getVideo, listVideos } from "@/lib/firestore/videos";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = {
  title: "Kho tài liệu",
  description: "Video hướng dẫn và tài liệu tham khảo cho hành trình luyện chữ.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const ID = /^[A-Za-z0-9_-]{1,64}$/;

function one(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : null;
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const viewer = await getViewer();
  const pageNo = Number(one(sp.trang)) || 1;
  const xemRaw = one(sp.xem);
  const xem = xemRaw && ID.test(xemRaw) ? xemRaw : null;

  const [videos, docs, current] = await Promise.all([listVideos("guide", viewer, pageNo), listDocuments(viewer), xem ? getVideo("guide", xem, viewer) : Promise.resolve(null)]);
  const playing = current && current.status === "ok" ? current.data : null;
  const bad = [videos, docs].find((r) => r.status !== "ok");

  return (
    <SidebarLayout>
      <article className="tl">
        <header className="tl-hero">
          <p className="tl-kicker">Thanh Phong Thư Môn</p>
          <h1>Học từ nét bút, vững từng ngày</h1>
          <p>Không gian bài giảng, hướng dẫn và tài liệu dành cho hành trình luyện chữ của bạn.</p>
        </header>

        {bad?.status === "unconfigured" ? <p className="tl-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {bad?.status === "error" ? <p className="tl-notice tl-notice-error">Chưa đọc được dữ liệu. Vui lòng thử lại sau.</p> : null}

        <div className="tl-upgrade">
          <p>Video trả phí được mở cho học viên có gói nâng cấp. Gói Ủng hộ và các gói khác nằm ở trang đăng ký học.</p>
          <Link href="/dang-ky-hoc">Xem các gói</Link>
        </div>

        {playing ? <VideoPlayer video={playing} closeHref={pageNo > 1 ? `/tai-lieu?trang=${pageNo}` : "/tai-lieu"} /> : null}

        <section className="tl-section" aria-labelledby="tl-videos">
          <h2 id="tl-videos">
            <span>01</span> Video hướng dẫn
          </h2>
          <p>Học theo từng cấp độ, luyện tập đều đặn và nộp bài để tích lũy điểm kinh nghiệm.</p>
          {videos.status === "ok" ? <VideoList page={videos.data} basePath="/tai-lieu" guest={!viewer} emptyText="Chưa có video hướng dẫn." /> : null}
          <p>
            Video xem lại buổi học nằm ở mục <Link href="/xem-lai-video">Xem lại video</Link>.
          </p>
        </section>

        <section className="tl-section" aria-labelledby="tl-docs">
          <h2 id="tl-docs">
            <span>02</span> Tài liệu tham khảo
          </h2>
          {docs.status === "ok" && docs.data.length === 0 ? <p className="tl-empty">Chưa có tài liệu.</p> : null}
          {docs.status === "ok" ? (
            <ul className="tl-docs">
              {docs.data.map((d) => (
                <li key={d.id} className="tl-doc">
                  <span className="tl-doc-mark" aria-hidden="true">
                    {d.mark || "文"}
                  </span>
                  <div>
                    <h3>{d.title}</h3>
                    {d.description ? <p>{d.description}</p> : null}
                    {d.allowed && d.href ? (
                      <a className="tl-link-btn" href={d.href} target="_blank" rel="noopener noreferrer">
                        Mở tài liệu
                      </a>
                    ) : (
                      <p>{d.access === "paid" ? "Cần gói nâng cấp." : "Đăng nhập để mở."}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            Mẫu chữ để lâm mô nằm ở <Link href="/mau-lam-mo">Thư viện lâm mô</Link>.
          </p>
        </section>
      </article>
    </SidebarLayout>
  );
}
