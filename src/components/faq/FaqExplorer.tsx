"use client";

import { useState } from "react";

import { SiteAnchor } from "@/components/RichText";
import { faqHero, faqSections, type FaqBlock, type FaqCategoryId } from "@/data/faq";
import { countFaq, filterFaq } from "@/lib/faq-filter";

function Block({ block }: { block: FaqBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "note":
      return <div className="qa-note">{block.text}</div>;
    case "warning":
      return <div className="qa-warning">{block.text}</div>;
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "buttons":
      return (
        <div className="qa-buttons">
          {block.buttons.map((button) => (
            <SiteAnchor key={button.label} href={button.href} className="qa-link">
              {button.label}
            </SiteAnchor>
          ))}
        </div>
      );
  }
}

const FILTERS: { id: FaqCategoryId | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  ...faqSections.map((s) => ({ id: s.id, label: s.filterLabel })),
];

/** Tìm kiếm + lọc theo nhóm chạy hoàn toàn ở trình duyệt; toàn bộ nội dung đã có sẵn trong trang (không gọi mạng). */
export function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategoryId | "all">("all");

  const total = countFaq(faqSections);
  const { sections, count } = filterFaq(faqSections, query, category);
  const filtering = query.trim() !== "" || category !== "all";

  return (
    <>
      <div className="qa-search">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={faqHero.searchPlaceholder}
          aria-label="Tìm câu hỏi"
          autoComplete="off"
        />
        {query ? (
          <button type="button" className="qa-clear" aria-label="Xóa nội dung tìm kiếm" onClick={() => setQuery("")}>
            ×
          </button>
        ) : null}
      </div>

      <div className="qa-filters" role="group" aria-label="Lọc theo nhóm">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={category === filter.id ? "qa-filter is-active" : "qa-filter"}
            aria-pressed={category === filter.id}
            onClick={() => setCategory(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <p className="qa-count" role="status" aria-live="polite">
        {filtering ? `Đang hiển thị ${count} câu hỏi` : `Đang hiển thị tất cả ${total} câu hỏi`}
      </p>

      {sections.map((section) => (
        <section key={section.id} className="qa-section" aria-labelledby={`qa-${section.id}`}>
          <header className="qa-section-head">
            <div className="qa-section-icon" aria-hidden="true">
              {section.icon}
            </div>
            <div>
              <h2 id={`qa-${section.id}`} className="qa-section-title">
                {section.title}
              </h2>
              <p className="qa-section-note">{section.note}</p>
            </div>
          </header>
          <div className="qa-list">
            {section.items.map((item) => (
              <details key={item.question} className="qa-item">
                <summary>{item.question}</summary>
                <div className="qa-answer">
                  {item.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      {count === 0 ? (
        <div className="qa-empty">
          <strong>🔍 {faqHero.emptyTitle}</strong>
          <p>{faqHero.emptyText}</p>
        </div>
      ) : null}
    </>
  );
}
