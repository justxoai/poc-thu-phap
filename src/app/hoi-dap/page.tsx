import type { Metadata } from "next";

import { FaqSections } from "@/components/faq/FaqSections";
import { SidebarLayout } from "@/components/shell/SidebarLayout";
import { Icon } from "@/components/ui/Icon";
import { PageBanner } from "@/components/ui/PageBanner";
import { faqFootnote, faqHero } from "@/data/faq";

import "@/components/faq/faq.css";

export const metadata: Metadata = {
  title: "Hỏi đáp nhanh",
  description: "Những câu hỏi thường gặp của học viên mới: đăng ký, nộp bài, tra cứu kết quả, Linh thạch và Chợ phiên.",
};

// Nội dung cố định (data/faq.json): dựng sẵn, không chạm Firestore.
export const dynamic = "force-static";

export default function FaqPage() {
  return (
    <SidebarLayout>
      <article className="qa">
        <PageBanner title={faqHero.title} lead={faqHero.lead} />

        <section className="qa-start" aria-labelledby="qa-start-title">
          <h2 id="qa-start-title">{faqHero.startTitle}</h2>
          <ol className="qa-steps">
            {faqHero.steps.map((step) => (
              <li key={step.title} className="qa-step">
                <span className="qa-step-icon" aria-hidden="true">
                  <Icon name={step.icon} size={30} />
                </span>
                <strong>{step.title}</strong>
                <span className="qa-step-text">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <FaqSections />

        <p className="qa-foot">{faqFootnote}</p>
      </article>
    </SidebarLayout>
  );
}
