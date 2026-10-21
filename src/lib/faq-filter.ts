import type { FaqBlock, FaqCategoryId, FaqSection } from "@/data/faq";
import { normalizeText } from "@/lib/text";

function blockText(block: FaqBlock): string {
  switch (block.kind) {
    case "p":
    case "note":
    case "warning":
      return block.text;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "buttons":
      return block.buttons.map((b) => b.label).join(" ");
  }
}

export type FaqFilterResult = { sections: FaqSection[]; count: number };

/** Lọc theo nhóm và từ khóa (khớp câu hỏi + nội dung trả lời). Nhóm không còn câu nào thì bị ẩn. */
export function filterFaq(
  sections: readonly FaqSection[],
  query: string,
  category: FaqCategoryId | "all",
): FaqFilterResult {
  const needle = normalizeText(query);
  const out: FaqSection[] = [];
  let count = 0;
  for (const section of sections) {
    if (category !== "all" && section.id !== category) continue;
    const items = needle
      ? section.items.filter((item) =>
          normalizeText([item.question, ...item.blocks.map(blockText)].join(" ")).includes(needle),
        )
      : section.items;
    if (items.length === 0) continue;
    count += items.length;
    out.push({ ...section, items });
  }
  return { sections: out, count };
}

export function countFaq(sections: readonly FaqSection[]): number {
  return sections.reduce((sum, s) => sum + s.items.length, 0);
}
