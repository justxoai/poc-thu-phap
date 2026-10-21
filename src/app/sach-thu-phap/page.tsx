import type { Metadata } from "next";

import { BookOrderForm } from "@/components/book/BookOrderForm";
import { DriveImage } from "@/components/DriveImage";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import {
  bookCompanion,
  bookContents,
  bookFoundation,
  bookFooter,
  bookForeword,
  bookHero,
  bookImages,
  bookJourney,
  bookOrder,
  bookPreview,
  bookPrices,
  bookReviews,
  bookRoadmap,
  bookStudentOffer,
} from "@/data/book";
import { formatVnd } from "@/lib/format";

import "./book.css";

export const metadata: Metadata = {
  title: "Sách Thư pháp Việt · Quyển I",
  description: "Thư pháp Việt · Quyển I, sách nhập môn dành cho người mới bắt đầu. Bảng giá, mục lục và phiếu đăng ký mua sách.",
};

// Trang giới thiệu: dựng sẵn. Phiếu đặt sách gửi qua Server Action nên không cần trang động.
export const dynamic = "force-static";

function Heading({ no, label, eyebrow, title, lead }: { no: string; label: string; eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="bk-heading">
      <p className="bk-kicker">
        <span>{no}</span> {label}
      </p>
      <p className="bk-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lead ? <p className="bk-lead">{lead}</p> : null}
    </header>
  );
}

export default function BookPage() {
  return (
    <SidebarLayout>
      <article className="bk">
        <section className="bk-hero" aria-labelledby="bk-title">
          <div className="bk-hero-text">
            <p className="bk-mark">{bookHero.mark}</p>
            <h1 id="bk-title">
              {bookHero.titleLines[0]}
              <br />
              <span>{bookHero.titleLines[1]}</span>
            </h1>
            <p className="bk-hero-lead">{bookHero.lead}</p>
            <div className="bk-actions">
              <a href="#dat-sach" className="bk-btn bk-btn-primary">
                {bookHero.primary}
              </a>
              <a href="#gia-sach" className="bk-btn bk-btn-ghost">
                {bookHero.secondary}
              </a>
            </div>
          </div>
          <div className="bk-hero-cover">
            <DriveImage id={bookImages.cover.id} alt={bookImages.cover.alt} width={640} height={800} fetchWidth={900} priority />
          </div>
        </section>

        <section className="bk-offer" aria-label="Ưu đãi dành cho học viên">
          <div>
            <p className="bk-offer-tag">{bookStudentOffer.tag}</p>
            <h2>{bookStudentOffer.title}</h2>
            <p>{bookStudentOffer.text}</p>
            <p className="bk-offer-chip">
              <strong>{bookStudentOffer.chip}</strong> {bookStudentOffer.chipHint}
            </p>
          </div>
          <div className="bk-offer-price" aria-label="Giá cho học viên">
            <s>{formatVnd(380_000)}</s>
            <strong>{formatVnd(304_000)}</strong>
            <span>mỗi cuốn</span>
            <em>{bookStudentOffer.badge}</em>
          </div>
        </section>

        <section className="bk-section" id="gia-sach" aria-labelledby="bk-prices">
          <Heading no={bookPrices.no} label={bookPrices.label} eyebrow={bookPrices.eyebrow} title={bookPrices.title} />
          <ul className="bk-tiers" id="bk-prices">
            {bookPrices.tiers.map((tier) => (
              <li key={tier.name} className="bk-tier">
                <h3>{tier.name}</h3>
                <p className="bk-tier-price">
                  {tier.was ? <s>{formatVnd(tier.was)}</s> : null}
                  <strong>{formatVnd(tier.price)}</strong>
                </p>
                <p>{tier.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bk-section">
          <Heading no={bookJourney.no} label={bookJourney.label} eyebrow={bookJourney.eyebrow} title={bookJourney.title} />
          <div className="bk-split">
            <div>
              {bookJourney.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
              <blockquote className="bk-pull">{bookJourney.pull}</blockquote>
            </div>
            <figure className="bk-figure">
              <DriveImage id={bookImages.journey.id} alt={bookImages.journey.alt} width={640} height={640} fetchWidth={1000} />
              <figcaption>{bookJourney.caption}</figcaption>
            </figure>
          </div>
        </section>

        <section className="bk-section">
          <Heading no={bookFoundation.no} label={bookFoundation.label} eyebrow={bookFoundation.eyebrow} title={bookFoundation.title} lead={bookFoundation.lead} />
          <ol className="bk-points">
            {bookFoundation.points.map((point, index) => (
              <li key={point.title}>
                <span className="bk-point-no" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{point.title}</h3>
                  {point.text.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="bk-closing">
            <p>
              <strong>{bookFoundation.closing[0]}</strong>
            </p>
            <p>{bookFoundation.closing[1]}</p>
          </div>
        </section>

        <section className="bk-section">
          <Heading no={bookRoadmap.no} label={bookRoadmap.label} eyebrow={bookRoadmap.eyebrow} title={bookRoadmap.title} lead={bookRoadmap.lead} />
          <ol className="bk-stages">
            {bookRoadmap.stages.map((stage) => (
              <li key={stage.no}>
                <span>{stage.no}</span>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
              </li>
            ))}
          </ol>
          <figure className="bk-figure bk-figure-wide">
            <DriveImage id={bookImages.tools.id} alt={bookImages.tools.alt} width={1000} height={560} fetchWidth={1400} />
          </figure>
        </section>

        <section className="bk-section">
          <Heading no={bookContents.no} label={bookContents.label} eyebrow={bookContents.eyebrow} title={bookContents.title} lead={bookContents.lead} />
          <ol className="bk-toc">
            {bookContents.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="bk-section">
          <Heading no={bookPreview.no} label={bookPreview.label} eyebrow={bookPreview.eyebrow} title={bookPreview.title} lead={bookPreview.lead} />
          <figure className="bk-figure bk-figure-wide">
            <DriveImage id={bookImages.preview.id} alt={bookImages.preview.alt} width={1000} height={700} fetchWidth={1400} />
          </figure>
        </section>

        <section className="bk-section">
          <Heading no={bookCompanion.no} label={bookCompanion.label} eyebrow={bookCompanion.eyebrow} title={bookCompanion.title} />
          <div className="bk-pair">
            <figure className="bk-figure">
              <DriveImage id={bookImages.companionA.id} alt={bookImages.companionA.alt} width={560} height={560} fetchWidth={900} />
            </figure>
            <figure className="bk-figure">
              <DriveImage id={bookImages.companionB.id} alt={bookImages.companionB.alt} width={560} height={560} fetchWidth={900} />
            </figure>
          </div>
          <p className="bk-center">{bookCompanion.closing}</p>
        </section>

        <section className="bk-section bk-foreword">
          <Heading no={bookForeword.no} label={bookForeword.label} eyebrow={bookForeword.eyebrow} title={bookForeword.title} />
          {bookForeword.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p className="bk-signature">{bookForeword.signature}</p>
        </section>

        <section className="bk-section">
          <Heading no={bookReviews.no} label={bookReviews.label} eyebrow={bookReviews.eyebrow} title={bookReviews.title} />
          <ul className="bk-reviews" aria-label="Phản hồi của khách hàng">
            {bookImages.reviews.map((id, index) => (
              <li key={id}>
                <DriveImage id={id} alt={`Phản hồi của khách hàng ${index + 1}`} width={320} height={480} fetchWidth={800} />
              </li>
            ))}
          </ul>
          <p className="bk-hint">{bookReviews.hint}</p>
        </section>

        <section className="bk-section bk-order" id="dat-sach" aria-labelledby="bk-order-title">
          <Heading no={bookOrder.no} label={bookOrder.label} eyebrow={bookOrder.eyebrow} title={bookOrder.title} />
          <div className="bk-order-grid">
            <aside className="bk-order-side">
              <DriveImage id={bookImages.order.id} alt={bookImages.order.alt} width={320} height={420} fetchWidth={700} />
              <ul>
                <li>
                  <span>Giá bìa</span> <strong>{formatVnd(380_000)}</strong>
                </li>
                <li>
                  <span>Đăng ký sớm · 50 khách đầu</span> <strong>{formatVnd(342_000)}</strong>
                </li>
                <li>
                  <span>Học viên · nhập Mã học viên</span> <strong>{formatVnd(304_000)}</strong>
                </li>
              </ul>
              <div className="bk-hotline">
                <span>Hotline hỗ trợ</span>
                {bookOrder.hotlines.map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`}>
                    {phone}
                  </a>
                ))}
              </div>
            </aside>
            <div id="bk-order-title">
              <BookOrderForm />
            </div>
          </div>
        </section>

        <footer className="bk-footer">
          <div>
            <strong>{bookFooter.title}</strong>
            <span>{bookFooter.tagline}</span>
          </div>
        </footer>
      </article>
    </SidebarLayout>
  );
}
