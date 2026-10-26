import type { Metadata } from "next";

import { FaqPanel } from "@/components/guide/FaqPanel";
import { ZoomFigure } from "@/components/guide/ZoomFigure";
import { RichText, SiteAnchor } from "@/components/RichText";
import { Icon } from "@/components/ui/Icon";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import {
  guideHelp,
  guideHero,
  guideGoals,
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
        </header>

        <div className="guide-wrap">
          <h2>{guideIntro.title}</h2>
          <p>{guideIntro.text}</p>
        </div>

        <ul className="guide-goals">
          {guideGoals.map((goal) => (
            <li className="guide-goal" key={goal.title}>
              <span className="guide-goal-icon" aria-hidden="true">
                <Icon name={goal.icon} size={22} />
              </span>
              <h3>{goal.title}</h3>
              <p>{goal.text}</p>
              <SiteAnchor href={goal.href} className="guide-more">
                {goal.cta}
                <Icon name="chevron-right" size={16} />
              </SiteAnchor>
            </li>
          ))}
        </ul>

        <details className="guide-all">
          <summary>
            <span>{guideIntro.allLabel}</span>
            <Icon name="chevron-down" size={20} className="guide-acc-arrow" />
          </summary>
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
        </details>

        <div className="guide-list">
          {guideSections.map((section) => (
            <details className="guide-acc" name="guide-acc" id={section.id} key={section.id}>
              <summary>
                <span className="guide-acc-title">{section.title}</span>
                <Icon name="chevron-down" size={22} className="guide-acc-arrow" />
              </summary>
              <div className="guide-acc-body">
                <p className="guide-sub">{section.sub}</p>

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

                <SiteAnchor href={section.cta.href} className="guide-more">
                  {section.cta.label}
                  <Icon name="chevron-right" size={16} />
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
              </div>
            </details>
          ))}
        </div>

        <section className="guide-section" id="td-ho-tro">
          <h2>{guideHelp.title}</h2>
          <FaqPanel items={guideHelp.items} label={guideHelp.title} />
          <SiteAnchor href={guideHelp.more.href} className="guide-more">
            {guideHelp.more.label}
            <Icon name="chevron-right" size={16} />
          </SiteAnchor>
        </section>
      </article>
    </SidebarLayout>
  );
}
