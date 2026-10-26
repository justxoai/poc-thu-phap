"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { RichText } from "@/components/RichText";
import type { GuideFaqItem } from "@/data/guide";

/**
 * Hỏi đáp hai cột: bên trái là các câu hỏi, bấm một câu thì câu trả lời hiện bên phải (điện thoại: câu trả lời hiện dưới danh sách).
 * Dùng mẫu "tab" của WAI-ARIA: mũi tên lên/xuống đổi câu hỏi, Home/End nhảy về đầu/cuối.
 * Câu trả lời cho phép **chữ đậm** và [nhãn](đường dẫn) như các chuỗi khác của trang.
 */
export function FaqPanel({ items, label }: { items: GuideFaqItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(to: number) {
    const next = (to + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") move(index + 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
    else return;
    event.preventDefault();
  }

  if (items.length === 0) return null;

  return (
    <div className="guide-faq">
      <div className="guide-faq-list" role="tablist" aria-label={label} aria-orientation="vertical">
        {items.map((item, index) => (
          <button
            key={item.question}
            ref={(el: HTMLButtonElement | null) => {
              tabs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`faq-tab-${index}`}
            aria-selected={index === active}
            aria-controls="faq-panel"
            tabIndex={index === active ? 0 : -1}
            className={index === active ? "guide-faq-q is-active" : "guide-faq-q"}
            onClick={() => setActive(index)}
            onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, index)}
          >
            {item.question}
          </button>
        ))}
      </div>
      <div className="guide-faq-answer" role="tabpanel" id="faq-panel" aria-labelledby={`faq-tab-${active}`} tabIndex={0}>
        <h3>{items[active].question}</h3>
        <p>
          <RichText text={items[active].answer} />
        </p>
      </div>
    </div>
  );
}
