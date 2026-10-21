import type { Metadata } from "next";
import Link from "next/link";

import { DriveImage } from "@/components/DriveImage";
import { PostGrid } from "@/components/posts/PostCard";
import { SealOrderForm } from "@/components/seal/SealOrderForm";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { SEAL_POST_LABEL, sealFaq, sealHero, sealStonesShowcase } from "@/data/seal";
import { labelSlug } from "@/data/labels";
import { listPosts } from "@/lib/firestore/posts";

import "@/components/posts/posts.css";
import "./seal.css";

export const metadata: Metadata = {
  title: "Đặt làm ấn",
  description: "Ấn triện thủ công cho người viết thư pháp: chọn đá, chọn chữ, khắc tay. Bảng giá và phiếu đăng ký làm ấn.",
};

// Trang giới thiệu dựng sẵn (làm mới mỗi 5 phút để cập nhật bài viết liên quan). Phiếu gửi qua Server Action.
export const revalidate = 300;

export default async function SealPage() {
  const related = await listPosts({ label: SEAL_POST_LABEL, limit: 4 });

  return (
    <SidebarLayout>
      <article className="sl">
        <section className="sl-hero" aria-labelledby="sl-title">
          <div>
            <p className="sl-mark" aria-hidden="true">
              {sealHero.mark}
            </p>
            <h1 id="sl-title">{sealHero.title}</h1>
            <p className="sl-headline">{sealHero.headline}</p>
            <p className="sl-lead">{sealHero.lead}</p>
            <a className="sl-cta" href="#dat-an">
              {sealHero.cta}
            </a>
          </div>
          <ul className="sl-stones" aria-label="Bốn loại đá ấn">
            {sealStonesShowcase.map((stone) => (
              <li key={stone.id}>
                <DriveImage id={stone.id} alt={`Ấn ${stone.name}`} width={200} height={200} fetchWidth={400} />
                <span>{stone.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sl-section" aria-label="Phiếu đăng ký làm ấn">
          <SealOrderForm />
        </section>

        <section className="sl-section" aria-labelledby="sl-faq">
          <h2 id="sl-faq">Hỏi đáp nhanh</h2>
          <div className="sl-faq">
            {sealFaq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.status === "ok" && related.data.posts.length > 0 ? (
          <section className="sl-section pt" aria-labelledby="sl-related">
            <h2 id="sl-related">Các bài viết liên quan</h2>
            <PostGrid posts={related.data.posts} />
            <p className="sl-more">
              <Link href={`/nhan/${labelSlug(SEAL_POST_LABEL)}`}>Tất cả bài viết “{SEAL_POST_LABEL}” →</Link>
            </p>
          </section>
        ) : null}
      </article>
    </SidebarLayout>
  );
}
