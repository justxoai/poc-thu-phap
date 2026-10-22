import Image from "next/image";

import { SocialLinks } from "@/components/shell/SocialLinks";
import { latestPosts } from "@/data/posts";
import { topicHref, topics } from "@/data/topics";

/** Thanh bên dùng chung cho các trang con: Bài viết mới, Theo dõi, Chủ đề. */
export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Thanh bên">
      <section className="side-box" aria-labelledby="side-latest">
        <h2 id="side-latest" className="side-title">
          Bài viết mới
        </h2>
        <ul className="side-posts">
          {latestPosts.map((post) => (
            <li key={post.href}>
              <a href={post.href} className="side-post">
                <Image src={post.image} alt="" width={64} height={64} />
                <span>
                  <span className="side-post-title">{post.title}</span>
                  <time className="side-post-date">{post.date}</time>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-box" aria-labelledby="side-follow">
        <h2 id="side-follow" className="side-title">
          Theo dõi
        </h2>
        <SocialLinks className="side-follow" />
      </section>

      <section className="side-box" aria-labelledby="side-topics">
        <h2 id="side-topics" className="side-title">
          Chủ đề
        </h2>
        <ul className="side-topics">
          {topics.map((topic) => (
            <li key={topic.name}>
              <a href={topicHref(topic.name)}>
                <span>{topic.name}</span>
                <span className="side-count">{topic.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
