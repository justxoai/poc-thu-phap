import type { Metadata } from "next";
import Link from "next/link";

import { PostGrid } from "@/components/posts/PostCard";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { POST_LABELS, labelSlug } from "@/data/labels";
import { listPosts } from "@/lib/firestore/posts";

import "@/components/posts/posts.css";

export const metadata: Metadata = {
  title: "Tin tức và bài viết",
  description: "Thông báo, kiến thức và hướng dẫn thực hành thư pháp từ Thanh Phong Thư Môn.",
};

export const revalidate = 120;

type Props = { searchParams: Promise<{ cursor?: string | string[] }> };

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : null;
  const result = await listPosts({ cursor });

  return (
    <SidebarLayout>
      <div className="pt">
        <header className="pt-head">
          <h1>Tin tức và bài viết</h1>
          <p>Thông báo, kiến thức và hướng dẫn thực hành thư pháp.</p>
        </header>
        <ul className="pt-chips" aria-label="Chủ đề">
          <li>
            <a href="/tin-tuc" aria-current="page">
              Tất cả
            </a>
          </li>
          {POST_LABELS.map((label) => (
            <li key={label}>
              <Link href={`/nhan/${labelSlug(label)}`}>{label}</Link>
            </li>
          ))}
        </ul>
        {result.status === "unconfigured" ? <p className="pt-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {result.status === "error" ? <p className="pt-notice pt-notice-error">Chưa đọc được bài viết. Vui lòng thử lại sau.</p> : null}
        {result.status === "ok" && result.data.posts.length === 0 ? <p className="pt-empty">Chưa có bài viết.</p> : null}
        {result.status === "ok" && result.data.posts.length > 0 ? (
          <>
            <PostGrid posts={result.data.posts} />
            {result.data.nextCursor ? (
              <p className="pt-pager">
                <Link href={`/tin-tuc?cursor=${result.data.nextCursor}`}>Bài cũ hơn →</Link>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </SidebarLayout>
  );
}
