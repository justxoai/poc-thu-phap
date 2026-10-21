import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostGrid } from "@/components/posts/PostCard";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { POST_LABELS, labelFromSlug, labelSlug } from "@/data/labels";
import { listPosts } from "@/lib/firestore/posts";

import "@/components/posts/posts.css";

// Chỉ các chủ đề khai báo trong data/labels.ts mới hợp lệ.
export const dynamicParams = false;
export const revalidate = 120;

type Props = { params: Promise<{ label: string }>; searchParams: Promise<{ cursor?: string | string[] }> };

export function generateStaticParams() {
  return POST_LABELS.map((label) => ({ label: labelSlug(label) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = labelFromSlug((await params).label);
  return { title: label ? `Chủ đề: ${label}` : "Không tìm thấy chủ đề" };
}

export default async function LabelPage({ params, searchParams }: Props) {
  const label = labelFromSlug((await params).label);
  if (!label) notFound();
  const query = await searchParams;
  const cursor = typeof query.cursor === "string" ? query.cursor : null;
  const result = await listPosts({ label, cursor });

  return (
    <SidebarLayout>
      <div className="pt">
        <header className="pt-head">
          <h1>Chủ đề: {label}</h1>
          <p>
            <Link href="/tin-tuc">← Tất cả bài viết</Link>
          </p>
        </header>
        <ul className="pt-chips" aria-label="Chủ đề">
          {POST_LABELS.map((l) => (
            <li key={l}>
              <Link href={`/nhan/${labelSlug(l)}`} aria-current={l === label ? "page" : undefined}>
                {l}
              </Link>
            </li>
          ))}
        </ul>
        {result.status === "unconfigured" ? <p className="pt-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {result.status === "error" ? <p className="pt-notice pt-notice-error">Chưa đọc được bài viết. Vui lòng thử lại sau.</p> : null}
        {result.status === "ok" && result.data.posts.length === 0 ? <p className="pt-empty">Chưa có bài viết trong chủ đề này.</p> : null}
        {result.status === "ok" && result.data.posts.length > 0 ? (
          <>
            <PostGrid posts={result.data.posts} />
            {result.data.nextCursor ? (
              <p className="pt-pager">
                <Link href={`/nhan/${labelSlug(label)}?cursor=${result.data.nextCursor}`}>Bài cũ hơn →</Link>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </SidebarLayout>
  );
}
