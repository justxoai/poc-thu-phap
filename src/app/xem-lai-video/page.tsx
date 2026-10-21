import type { Metadata } from "next";
import Link from "next/link";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { VideoList, VideoPlayer } from "@/components/library/VideoList";
import { getVideo, listVideos } from "@/lib/firestore/videos";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = {
  title: "Xem lại video",
  description: "Video xem lại các buổi học của khóa bạn đang theo học.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const ID = /^[A-Za-z0-9_-]{1,64}$/;

function one(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : null;
}

export default async function ReplayPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const viewer = await getViewer();
  const pageNo = Number(one(sp.trang)) || 1;
  const xemRaw = one(sp.xem);
  const xem = xemRaw && ID.test(xemRaw) ? xemRaw : null;

  const [videos, current] = await Promise.all([listVideos("replay", viewer, pageNo), xem ? getVideo("replay", xem, viewer) : Promise.resolve(null)]);
  const playing = current && current.status === "ok" ? current.data : null;

  return (
    <SidebarLayout>
      <article className="tl">
        <header className="tl-hero">
          <p className="tl-kicker">Xem lại video</p>
          <h1>Video xem lại các buổi học</h1>
          <p>{viewer ? `Bài giảng của khóa ${viewer.course || "bạn"} đang theo học.` : "Video xem lại chỉ dành cho học viên của từng khóa."}</p>
        </header>

        {videos.status === "unconfigured" ? <p className="tl-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {videos.status === "error" ? <p className="tl-notice tl-notice-error">Chưa đọc được dữ liệu. Vui lòng thử lại sau.</p> : null}

        {!viewer ? (
          <div className="tl-upgrade">
            <p>Đăng nhập học viên (sắp có) để xem lại các buổi học của khóa bạn. Video hướng dẫn nhập môn xem được ngay ở Kho tài liệu.</p>
            <Link href="/tai-lieu">Kho tài liệu</Link>
          </div>
        ) : null}

        {playing ? <VideoPlayer video={playing} closeHref={pageNo > 1 ? `/xem-lai-video?trang=${pageNo}` : "/xem-lai-video"} /> : null}

        {videos.status === "ok" && viewer ? (
          <section className="tl-section" aria-label="Danh sách video xem lại">
            <VideoList page={videos.data} basePath="/xem-lai-video" guest={false} emptyText="Chưa có video xem lại cho khóa đang theo học." />
          </section>
        ) : null}
      </article>
    </SidebarLayout>
  );
}
