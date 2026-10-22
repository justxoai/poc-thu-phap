import Image from "next/image";

import { latestPosts } from "@/data/posts";

export function LatestPosts() {
  const [featured, ...others] = latestPosts;

  return (
    <section className="container latest-panel" aria-labelledby="latest-title">
      <h2 id="latest-title" className="section-title">
        Bài đăng mới
      </h2>
      <p className="section-intro">
        Những bài viết, hướng dẫn và câu chuyện mới nhất từ Thanh Phong Thư Môn.
      </p>

      <div className="posts-grid">
        {featured ? (
          <article className="post-card post-featured">
            <a className="post-media" href={featured.href} tabIndex={-1} aria-hidden="true">
              <Image
                src={featured.image}
                alt=""
                fill
                priority
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </a>
            <div className="post-copy">
              <span className="post-label">{featured.label}</span>
              <h3>
                <a href={featured.href}>{featured.title}</a>
              </h3>
              {featured.excerpt ? <p className="post-excerpt">{featured.excerpt}</p> : null}
              <time className="post-meta">{featured.date}</time>
            </div>
          </article>
        ) : null}

        {others.map((post) => (
          <article key={post.href} className="post-card">
            <a className="post-media" href={post.href} tabIndex={-1} aria-hidden="true">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(min-width: 900px) 25vw, (min-width: 600px) 50vw, 100vw"
              />
            </a>
            <div className="post-copy">
              <span className="post-label">{post.label}</span>
              <h3>
                <a href={post.href}>{post.title}</a>
              </h3>
              <time className="post-meta">{post.date}</time>
            </div>
          </article>
        ))}
      </div>

      <p className="posts-more">
        <a href="https://www.thudao.com/search?max-results=12">Xem tất cả bài viết</a>
      </p>
    </section>
  );
}
