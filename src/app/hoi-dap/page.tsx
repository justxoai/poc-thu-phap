import type { Metadata } from "next";

import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { SiteAnchor } from "@/components/RichText";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { faqHelp, faqHero } from "@/data/faq";

import "@/components/faq/faq.css";

export const metadata: Metadata = {
  title: "Hỏi đáp nhanh",
  description: "Những câu hỏi thường gặp của học viên mới: đăng ký, nộp bài, tra cứu kết quả, Linh thạch và Chợ phiên.",
};

// Nội dung cố định: dựng sẵn, không chạm Firestore.
export const dynamic = "force-static";

export default function FaqPage() {
  return (
    <SidebarLayout>
      <article className="qa">
        <header className="qa-hero">
          <p className="qa-mark">{faqHero.mark}</p>
          <h1>{faqHero.title}</h1>
          <p className="qa-lead">{faqHero.lead}</p>
          <div className="qa-start">
            <h2>{faqHero.startTitle}</h2>
            <ol className="qa-steps">
              {faqHero.steps.map((step, index) => (
                <li key={step.title} className="qa-step">
                  <span className="qa-step-no" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </header>

        <FaqExplorer />

        <section className="qa-help" aria-labelledby="qa-help-title">
          <h2 id="qa-help-title">💬 {faqHelp.title}</h2>
          <p>{faqHelp.text}</p>
          <div className="qa-buttons">
            {faqHelp.buttons.map((button) => (
              <SiteAnchor key={button.label} href={button.href} className="qa-link">
                {button.label}
              </SiteAnchor>
            ))}
          </div>
        </section>
        <p className="qa-foot">{faqHelp.footnote}</p>
      </article>
    </SidebarLayout>
  );
}
