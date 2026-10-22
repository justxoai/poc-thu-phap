import type { Metadata } from "next";
import Link from "next/link";

import { DriveImage } from "@/components/DriveImage";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { getLamMo, listLamMo, type LamMoItem } from "@/lib/firestore/lam-mo";
import { getViewer } from "@/lib/session";
import { youtubeEmbedUrl } from "@/lib/youtube";

import "./lam-mo.css";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Thư viện lâm mô thư pháp",
  description: "Mẫu chữ để lâm mô, mở dần theo điểm kinh nghiệm của học viên.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const SMALL = /^\d{1,6}$/;

function one(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : null;
}

function href(params: Record<string, string | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `/mau-lam-mo?${s}` : "/mau-lam-mo";
}

function Card({ item, keep }: { item: LamMoItem; keep: Record<string, string | null> }) {
  return (
    <li className={`lm-card${item.locked ? " lm-locked" : ""}`}>
      <Link href={href({ ...keep, xem: item.id })} className="lm-link">
        <div className="lm-img">
          {item.locked ? (
            <span aria-hidden="true">
              <Icon name="lock" size={28} />
            </span>
          ) : item.imageId ? (
            <DriveImage id={item.imageId} alt={`Mẫu lâm mô: ${item.content}`} width={320} height={320} />
          ) : (
            <span aria-hidden="true">書</span>
          )}
        </div>
        <div className="lm-body">
          <h3>{item.content}</h3>
          <p>Người viết: {item.author || "—"}</p>
          <p>Chủ đề: {item.topic || "—"}</p>
          {item.locked ? <p className="lm-need">Cần {item.unlockPoint} điểm kinh nghiệm</p> : null}
        </div>
      </Link>
    </li>
  );
}

export default async function LamMoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const viewer = await getViewer();
  const xp = viewer?.xp ?? 0;
  const q = (one(sp.q) ?? "").slice(0, 60);
  const chars = one(sp.chu) && SMALL.test(one(sp.chu)!) ? one(sp.chu) : null;
  const milestone = one(sp.moc) && SMALL.test(one(sp.moc)!) ? one(sp.moc) : null;
  const topicRaw = one(sp.de);
  const topic = topicRaw && topicRaw.length <= 80 ? topicRaw : null;
  const pageNo = Number(one(sp.trang)) || 1;
  const xemRaw = one(sp.xem);
  const xem = xemRaw && ID.test(xemRaw) ? xemRaw : null;

  const [list, detail] = await Promise.all([listLamMo({ q, chars, topic, milestone, page: pageNo }, xp), xem ? getLamMo(xem, xp) : Promise.resolve(null)]);
  const keep = { q: q || null, chu: chars, de: topic, moc: milestone, trang: pageNo > 1 ? String(pageNo) : null };
  const item = detail && detail.status === "ok" ? detail.data : null;

  return (
    <SidebarLayout>
      <article className="lm">
        <p className="lm-warn">Tài liệu phục vụ lâm mô không được tự ý sử dụng vào mục đích thương mại.</p>
        <header className="lm-head">
          <h1>Thư viện lâm mô thư pháp</h1>
          {viewer ? (
            <p>
              {viewer.name} · Điểm kinh nghiệm: {xp}
            </p>
          ) : (
            <p>Bạn đang xem với tư cách khách: chỉ thấy các bài mở sẵn (mốc 0 điểm). Đăng nhập học viên (sắp có) để mở khóa thêm theo điểm kinh nghiệm.</p>
          )}
          {list.status === "ok" ? (
            <p className="lm-count">
              Điểm kinh nghiệm: {xp} · Đã mở: {list.data.unlocked} bài · Chưa mở: {list.data.locked} bài
            </p>
          ) : null}
        </header>

        {list.status === "unconfigured" ? <p className="lm-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {list.status === "error" ? <p className="lm-notice lm-notice-error">Chưa đọc được thư viện. Vui lòng thử lại sau.</p> : null}

        {item ? (
          <section className="lm-detail" aria-label={`Chi tiết: ${item.content}`}>
            <div className="lm-detail-img">
              {item.locked ? <span aria-hidden="true">
              <Icon name="lock" size={28} />
            </span> : item.imageId ? <DriveImage id={item.imageId} alt={`Mẫu lâm mô: ${item.content}`} width={640} height={640} fetchWidth={1000} /> : null}
            </div>
            <div className="lm-detail-info">
              <h2>{item.content}</h2>
              <dl>
                <dt>Người viết</dt>
                <dd>{item.author || "—"}</dd>
                <dt>Tác giả nội dung</dt>
                <dd>{item.contentAuthor || "—"}</dd>
                <dt>Chủ đề</dt>
                <dd>{item.topic || "—"}</dd>
                <dt>Số lượng chữ</dt>
                <dd>{item.charCount}</dd>
                <dt>Điểm mở khóa</dt>
                <dd>{item.unlockPoint}</dd>
              </dl>
              {item.locked ? <p className="lm-need">Bài này mở khi bạn đạt {item.unlockPoint} điểm kinh nghiệm.</p> : null}
              {item.shortDesc ? <p>{item.shortDesc}</p> : null}
              {item.videoId ? (
                <div className="lm-video">
                  <iframe src={youtubeEmbedUrl(item.videoId)} title={`Video hướng dẫn: ${item.content}`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                </div>
              ) : null}
              <Link href={href(keep)} className="lm-close">
                Đóng
              </Link>
            </div>
          </section>
        ) : null}

        {list.status === "ok" ? (
          <>
            <form method="get" action="/mau-lam-mo" className="lm-filter">
              <label className="lm-search">
                Tìm kiếm
                <input type="search" name="q" defaultValue={q} maxLength={60} placeholder="Chữ, chủ đề, người viết..." />
              </label>
              <label>
                Số lượng chữ
                <select name="chu" defaultValue={chars ?? ""}>
                  <option value="">Tất cả</option>
                  {list.data.chars.map((c) => (
                    <option key={c} value={c}>
                      {c} chữ
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Chủ đề
                <select name="de" defaultValue={topic ?? ""}>
                  <option value="">Tất cả</option>
                  {list.data.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mốc điểm
                <select name="moc" defaultValue={milestone ?? ""}>
                  <option value="">Tất cả</option>
                  {list.data.milestones.map((m) => (
                    <option key={m} value={m}>
                      Mốc {m} điểm
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Lọc</button>
              <Link href="/mau-lam-mo">Xóa</Link>
            </form>

            {list.data.items.length === 0 ? (
              <p className="lm-empty">{list.data.total === 0 ? "Không có bài nào khớp bộ lọc." : "Trang này không có bài."}</p>
            ) : (
              <ul className="lm-grid">
                {list.data.items.map((i) => (
                  <Card key={i.id} item={i} keep={keep} />
                ))}
              </ul>
            )}

            {list.data.pages > 1 ? (
              <nav className="lm-pages" aria-label="Phân trang">
                {list.data.page > 1 ? <Link href={href({ ...keep, trang: String(list.data.page - 1) })}>← Trang trước</Link> : null}
                <span>
                  Trang {list.data.page} / {list.data.pages}
                </span>
                {list.data.page < list.data.pages ? <Link href={href({ ...keep, trang: String(list.data.page + 1) })}>Trang sau →</Link> : null}
              </nav>
            ) : null}
          </>
        ) : null}
      </article>
    </SidebarLayout>
  );
}
