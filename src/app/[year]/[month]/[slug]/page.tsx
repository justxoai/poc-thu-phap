import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { labelSlug } from "@/data/labels";
import { getPost } from "@/lib/firestore/posts";
import { formatVnDateTime } from "@/lib/format";
import { postDocId } from "@/lib/post-id";
import { sanitizePostHtml } from "@/lib/sanitize-post";

import "@/components/posts/posts.css";

// Bài mới tạo trong Firestore xuất hiện ngay ở lần xem đầu tiên và được lưu đệm 5 phút.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ year: string; month: string; slug: string }> };

async function load(params: Props["params"]) {
  const { year, month, slug } = await params;
  const id = postDocId(year, month, slug);
  return id ? getPost(id) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await load(params);
  if (result?.status === "ok" && result.data) return { title: result.data.title, description: result.data.summary || undefined };
  return { title: "Không tìm thấy bài viết" };
}

export default async function PostPage({ params }: Props) {
  const result = await load(params);
  if (!result || (result.status === "ok" && !result.data)) notFound();

  return (
    <SidebarLayout>
      <div className="pt">
        {result.status === "unconfigured" ? <p className="pt-notice">Chưa kết nối Firestore (thiếu biến môi trường Firebase).</p> : null}
        {result.status === "error" ? <p className="pt-notice pt-notice-error">Chưa đọc được bài viết. Vui lòng thử lại sau.</p> : null}
        {result.status === "ok" && result.data ? (
          <article className="pt-article">
            <header>
              <h1>{result.data.title}</h1>
              <div className="pt-meta">
                {result.data.publishedAt ? <time dateTime={result.data.publishedAt}>{formatVnDateTime(result.data.publishedAt).slice(0, 10)}</time> : null}
                {result.data.labels.map((label) => (
                  <Link key={label} className="pt-label" href={`/nhan/${labelSlug(label)}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </header>
            <div className="pt-body" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(result.data.html) }} />
            <p className="pt-back">
              <Link href="/tin-tuc">← Tất cả bài viết</Link>
            </p>
          </article>
        ) : null}
      </div>
    </SidebarLayout>
  );
}
