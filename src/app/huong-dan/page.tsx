import type { Metadata } from "next";

import { ZoomFigure } from "@/components/guide/ZoomFigure";
import { RichText, SiteAnchor } from "@/components/RichText";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import {
  guideFoot,
  guideHelp,
  guideHero,
  guideIntro,
  guideMap,
  guideSections,
} from "@/data/guide";

import "./guide.css";

export const metadata: Metadata = {
  title: "Hướng dẫn người mới",
  description:
    "Cẩm nang học viên Thanh Phong Thư Môn: nhận mã, vào Giảng đường, luyện công, nhận nhiệm vụ, nộp bài, xem hồ sơ, thứ hạng và triển lãm.",
};

// Trang tĩnh: dựng sẵn, không chạm Firestore.
export const dynamic = "force-static";

export default function GuidePage() {
  return (
    <SidebarLayout>
      <article className="guide">
        <header className="guide-hero">
          <span className="guide-eyebrow">{guideHero.eyebrow}</span>
          <h1>
            {guideHero.titleLines[0]}
            <br />
            {guideHero.titleLines[1]}
          </h1>
          <p className="guide-lead">{guideHero.lead}</p>
          <div className="guide-tags">
            {guideHero.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <a className="guide-button" href={guideHero.cta.href}>
            {guideHero.cta.label}
          </a>
        </header>

        <div className="guide-wrap">
          <span className="guide-eyebrow">{guideIntro.eyebrow}</span>
          <h2>{guideIntro.title}</h2>
          <nav aria-label="Mục lục hướng dẫn" className="guide-toc">
            {guideSections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                <b>{section.no}</b>
                <span>{section.title}</span>
              </a>
            ))}
          </nav>
          <div className="guide-path">{guideIntro.path}</div>
          <p>{guideIntro.text}</p>
          <h3>{guideIntro.mapTitle}</h3>
          <div className="guide-map">
            {guideMap.map((card) => (
              <div className="guide-card" key={card.title}>
                <h4>{card.title}</h4>
                <ul>
                  {card.links.map((link) => (
                    <li key={link.href}>
                      <SiteAnchor href={link.href}>{link.label}</SiteAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="guide-tiny">{guideIntro.tiny}</p>
        </div>

        {guideSections.map((section) => (
          <section className="guide-section" id={section.id} key={section.id}>
            <header>
              <span className="guide-num">{section.no}</span>
              <h2>{section.title}</h2>
              <p className="guide-sub">{section.sub}</p>
            </header>

            <ol className="guide-steps">
              {section.steps.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>
                    <RichText text={step.text} />
                  </span>
                </li>
              ))}
            </ol>

            <aside className="guide-note">
              <RichText text={section.note} />
            </aside>

            <SiteAnchor href={section.cta.href} className="guide-button">
              {section.cta.label}
            </SiteAnchor>

            <ZoomFigure image={section.image} />

            <div className="guide-video">
              <h3>Video hướng dẫn · {section.video.title}</h3>
              <div className="guide-player">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${section.video.youtubeId}`}
                  title={`Video hướng dẫn · ${section.video.title}`}
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <a
                className="guide-video-link"
                href={`https://www.youtube.com/watch?v=${section.video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Mở trên YouTube nếu video không phát ↗
              </a>
            </div>
          </section>
        ))}

        <section className="guide-section" id="td-ho-tro">
          <h2>{guideHelp.title}</h2>
          {guideHelp.items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
          <p>
            {guideHelp.more.before}
            <SiteAnchor href={guideHelp.more.href}>{guideHelp.more.label}</SiteAnchor>
            {guideHelp.more.after}
          </p>
        </section>

        <footer className="guide-foot">
          <h2>{guideFoot.title}</h2>
          <p>{guideFoot.text}</p>
          <SiteAnchor href={guideFoot.cta.href}>{guideFoot.cta.label}</SiteAnchor>
        </footer>
      </article>
    </SidebarLayout>
  );
}
