import Image from "next/image";
import Link from "next/link";

import type { VideoItem, VideoPage } from "@/lib/firestore/videos";
import { youtubeEmbedUrl, youtubeThumbUrl } from "@/lib/youtube";

import "./library.css";

function pageHref(basePath: string, page: number, xem: string | null): string {
  const q = new URLSearchParams();
  if (page > 1) q.set("trang", String(page));
  if (xem) q.set("xem", xem);
  const s = q.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function VideoPlayer({ video, closeHref }: { video: VideoItem; closeHref: string }) {
  return (
    <section className="tl-player" aria-label={`Đang xem: ${video.title}`}>
      {video.allowed && video.videoId ? (
        <div className="tl-player-frame">
          <iframe src={youtubeEmbedUrl(video.videoId)} title={video.title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      ) : (
        <p className="tl-lock">Video này chưa được mở cho bạn.</p>
      )}
      <div className="tl-player-bar">
        <strong>{video.title}</strong>
        <Link href={closeHref}>Đóng</Link>
      </div>
    </section>
  );
}

function VideoCard({ video, basePath, page, guest }: { video: VideoItem; basePath: string; page: number; guest: boolean }) {
  const replay = video.kind === "replay";
  const badge = video.paid ? `Trả phí · ${video.allowed ? "đã mở" : "chưa mở"}` : "Miễn phí";
  return (
    <li className="tl-card">
      <div className="tl-thumb">
        {video.allowed && video.videoId ? <Image src={youtubeThumbUrl(video.videoId)} alt="" width={320} height={180} unoptimized loading="lazy" /> : <span aria-hidden="true">{video.allowed ? "▶" : "🔒"}</span>}
      </div>
      <div className="tl-info">
        <p className="tl-meta">
          <span className="tl-lesson">
            {replay ? "BUỔI" : "BÀI"} {video.lesson}
          </span>
          <span className={`tl-badge${video.paid ? " tl-badge-paid" : ""}`}>{badge}</span>
        </p>
        <h3>{video.title}</h3>
        {video.description ? <p>{video.description}</p> : null}
        {!replay && video.difficulty > 0 ? <p className="tl-rank">Rank khuyến nghị: {video.difficulty}</p> : null}
        {video.allowed ? (
          <Link className="tl-watch" href={pageHref(basePath, page, video.id)}>
            Xem video →
          </Link>
        ) : (
          <span className="tl-watch tl-watch-off">{guest ? "Đăng nhập để xem" : "Cần gói nâng cấp"}</span>
        )}
      </div>
    </li>
  );
}

export function VideoList({ page, basePath, guest, emptyText }: { page: VideoPage; basePath: string; guest: boolean; emptyText: string }) {
  if (page.items.length === 0) return <p className="tl-empty">{emptyText}</p>;
  return (
    <>
      <ul className="tl-grid">
        {page.items.map((v) => (
          <VideoCard key={v.id} video={v} basePath={basePath} page={page.page} guest={guest} />
        ))}
      </ul>
      {page.pages > 1 ? (
        <nav className="tl-pages" aria-label="Phân trang">
          {page.page > 1 ? <Link href={pageHref(basePath, page.page - 1, null)}>← Trang trước</Link> : null}
          <span>
            Trang {page.page} / {page.pages}
          </span>
          {page.page < page.pages ? <Link href={pageHref(basePath, page.page + 1, null)}>Trang sau →</Link> : null}
        </nav>
      ) : null}
    </>
  );
}
