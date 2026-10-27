import { RichText, SiteAnchor } from "@/components/RichText";
import { faqGrouped } from "@/data/faq";
import { parseAnswer, type FaqBlock } from "@/lib/faq-markup";

function Block({ block }: { block: FaqBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "note":
      return (
        <div className="qa-note">
          <RichText text={block.text} />
        </div>
      );
    case "warning":
      return (
        <div className="qa-warning">
          <RichText text={block.text} />
        </div>
      );
    case "ul":
    case "ol": {
      const List = block.kind;
      return (
        <List>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </List>
      );
    }
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

/** Các nhóm câu hỏi, mỗi câu là một mục mở/đóng (HTML `<details>`, không cần JavaScript). Cùng `name="faq"` nên mở câu này thì câu đang mở tự đóng (toàn trang). Dữ liệu: data/faq.json. */
export function FaqSections() {
  return (
    <>
      {faqGrouped().map(({ group, items }) => (
        <section key={group.id} className="qa-section" aria-labelledby={`qa-${group.id}`}>
          <header className="qa-section-head">
            <h2 id={`qa-${group.id}`} className="qa-section-title">
              {group.title}
            </h2>
            <p className="qa-section-note">{group.note}</p>
          </header>
          <div className="qa-list">
            {items.map((item) => (
              <details key={item.question} name="faq" className="qa-item">
                <summary>
                  <span>{item.question}</span>
                  <span className="qa-toggle" aria-hidden="true" />
                </summary>
                <div className="qa-answer">
                  {parseAnswer(item.answer).map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
