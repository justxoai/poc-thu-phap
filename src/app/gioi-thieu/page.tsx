import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import {
  aboutEnd,
  aboutFounder,
  aboutHero,
  aboutPhilosophy,
  aboutSite,
  aboutVenue,
  type Paragraph,
} from "@/data/about";

import "./about.css";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Giới thiệu Việt Thư Đạo Quán, người sáng lập Thanh Phong và không gian học thư pháp Việt Thudao.com.",
};

// Trang tĩnh: dựng sẵn, không chạm Firestore.
export const dynamic = "force-static";

function Runs({ content }: { content: Paragraph }) {
  return (
    <>
      {content.map((run, i) =>
        typeof run === "string" ? <span key={i}>{run}</span> : <strong key={i}>{run.b}</strong>,
      )}
    </>
  );
}

function SectionHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="about-heading">
      <h2>{title}</h2>
      <p>{lead}</p>
    </header>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <section className="about-section">{children}</section>;
}

export default function AboutPage() {
  return (
    <SidebarLayout>
      <article className="about">
        <header className="about-hero">
          <div className="about-mark">{aboutHero.mark}</div>
          <h1>{aboutHero.title}</h1>
          <p className="about-sub">{aboutHero.sub}</p>
          <div className="about-line" aria-hidden="true" />
        </header>

        <div className="about-banner">
          <Image
            src={aboutHero.banner.src}
            alt={aboutHero.banner.alt}
            width={aboutHero.banner.w}
            height={aboutHero.banner.h}
            sizes="(min-width: 1200px) 860px, 100vw"
            priority
          />
        </div>

        <Section>
          <SectionHeading title={aboutVenue.title} lead={aboutVenue.lead} />
          <div className="about-box">
            {aboutVenue.paragraphs.map((p, i) => (
              <p key={i}>
                <Runs content={p} />
              </p>
            ))}
            <dl className="about-facts">
              {aboutVenue.facts.map((fact) => (
                <div className="about-fact" key={fact.label}>
                  <div className="about-fact-inner">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section>
          <SectionHeading title={aboutFounder.title} lead={aboutFounder.lead} />
          <div className="about-founder">
            <div className="about-founder-photo">
              <ImageLightbox
                src={aboutFounder.photo.src}
                alt={aboutFounder.photo.alt}
                width={aboutFounder.photo.w}
                height={aboutFounder.photo.h}
                sizes="(min-width: 760px) 330px, 90vw"
                caption={aboutFounder.name}
              />
            </div>
            <div className="about-founder-info">
              <div className="about-role">{aboutFounder.role}</div>
              <h3>{aboutFounder.name}</h3>
              {aboutFounder.rows.map((row) => (
                <div className="about-row" key={row.label}>
                  <strong>{row.label}</strong> {row.text}
                </div>
              ))}
            </div>
          </div>
          <blockquote className="about-quote">
            <p>{aboutFounder.quote}</p>
            <cite className="about-quote-author">{aboutFounder.quoteAuthor}</cite>
          </blockquote>
        </Section>

        <Section>
          <SectionHeading title={aboutSite.title} lead={aboutSite.lead} />
          <ul className="about-cards">
            {aboutSite.cards.map((card) => (
              <li className="about-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </li>
            ))}
          </ul>

          <div className="about-site">
            {aboutSite.paragraphs.map((p, i) => (
              <p key={i}>
                <Runs content={p} />
              </p>
            ))}
          </div>

          {aboutSite.features.map((feature, index) => (
            <div className={index % 2 === 1 ? "about-feature about-feature-flip" : "about-feature"} key={feature.tag}>
              <div className="about-feature-image">
                <Image
                  src={feature.image.src}
                  alt={feature.image.alt}
                  width={feature.image.w}
                  height={feature.image.h}
                  sizes="(min-width: 760px) 380px, 90vw"
                />
              </div>
              <div className="about-feature-content">
                <div className="about-tag">{feature.tag}</div>
                <h3>{feature.title}</h3>
                <p>
                  <Runs content={feature.paragraph} />
                </p>
                <Link className="about-more" href={feature.href}>
                  {feature.cta}
                  <Icon name="chevron-right" size={16} />
                </Link>
              </div>
            </div>
          ))}
        </Section>

        <section className="about-philosophy">
          <div className="about-philosophy-label">{aboutPhilosophy.label}</div>
          <h2>{aboutPhilosophy.title}</h2>
          {aboutPhilosophy.paragraphs.map((p, i) => (
            <p key={i}>
              <Runs content={p} />
            </p>
          ))}
          <p className="about-philosophy-main">
            {aboutPhilosophy.main[0]}
            <br />
            {aboutPhilosophy.main[1]}
          </p>
          <p>{aboutPhilosophy.closing}</p>
        </section>

        <section className="about-end">
          <div className="about-end-photo">
            <Image
              src={aboutEnd.photo.src}
              alt={aboutEnd.photo.alt}
              width={aboutEnd.photo.w}
              height={aboutEnd.photo.h}
              sizes="105px"
            />
          </div>
          <h2>{aboutEnd.title}</h2>
          <p>{aboutEnd.text}</p>
        </section>
      </article>
    </SidebarLayout>
  );
}
