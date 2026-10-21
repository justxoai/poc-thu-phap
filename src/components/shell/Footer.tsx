import Image from "next/image";

import { site } from "@/config/site";
import { featuredPosts } from "@/data/posts";

import { FollowUs } from "./FollowUs";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section aria-labelledby="footer-about">
          <h2 id="footer-about" className="footer-title">
            Giới thiệu
          </h2>
          <p>{site.about}</p>
          <p>
            <a href="https://www.thudao.com/search?max-results=12">Xem tất cả bài viết</a>
          </p>
        </section>

        <section aria-labelledby="footer-featured">
          <h2 id="footer-featured" className="footer-title">
            Nổi bật
          </h2>
          <ul className="featured-list">
            {featuredPosts.map((post) => (
              <li key={post.href}>
                <a href={post.href} className="featured-item">
                  <Image src={post.image} alt="" width={72} height={72} />
                  <span>{post.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <FollowUs />
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
