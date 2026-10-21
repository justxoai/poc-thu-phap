import Image from "next/image";
import Link from "next/link";

import { DriveImage } from "@/components/DriveImage";
import { labelSlug } from "@/data/labels";
import type { PostSummary } from "@/lib/firestore/posts";
import { formatVnDateTime } from "@/lib/format";

function dateOnly(iso: string | null): string {
  return iso ? formatVnDateTime(iso).slice(0, 10) : "";
}

function Thumb({ value }: { value: string }) {
  if (!value) return <span className="pt-thumb-empty" aria-hidden="true">文</span>;
  if (value.startsWith("https://")) return <Image src={value} alt="" width={480} height={300} unoptimized loading="lazy" />;
  return <DriveImage id={value} alt="" width={480} height={300} fetchWidth={640} />;
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="pt-card">
      <Link className="pt-thumb" href={post.href} aria-label={post.title} tabIndex={-1}>
        <Thumb value={post.thumbnail} />
      </Link>
      <div className="pt-card-body">
        {post.labels[0] ? (
          <Link className="pt-label" href={`/nhan/${labelSlug(post.labels[0])}`}>
            {post.labels[0]}
          </Link>
        ) : null}
        <h3>
          <Link href={post.href}>{post.title}</Link>
        </h3>
        {post.summary ? <p>{post.summary}</p> : null}
        {post.publishedAt ? <time dateTime={post.publishedAt}>{dateOnly(post.publishedAt)}</time> : null}
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="pt-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
