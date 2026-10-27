/**
 * Cú pháp ngắn cho câu trả lời trong data/faq.json (một chuỗi). Các đoạn cách nhau bằng một dòng trống:
 *   đoạn thường                      -> đoạn văn
 *   - ý một\n- ý hai                  -> danh sách chấm
 *   1. bước một\n2. bước hai          -> danh sách số
 *   > lưu ý                          -> khung lưu ý
 *   !> cảnh báo                      -> khung cảnh báo
 *   => [NHÃN](đường dẫn) [NHÃN](..)   -> một hàng nút liên kết
 * Trong nội dung vẫn dùng được **chữ đậm** và [nhãn](đường dẫn) (xem components/RichText.tsx).
 */
export type FaqBlock =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "note" | "warning"; text: string }
  | { kind: "buttons"; buttons: { label: string; href: string }[] };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseAnswer(answer: string): FaqBlock[] {
  const blocks: FaqBlock[] = [];
  for (const raw of answer.split(/\n{2,}/)) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split("\n").map((line) => line.trim());
    if (chunk.startsWith("=> ")) {
      const buttons = [...chunk.slice(3).matchAll(LINK)].map((m) => ({ label: m[1], href: m[2] }));
      if (buttons.length > 0) blocks.push({ kind: "buttons", buttons });
    } else if (chunk.startsWith("!> ")) {
      blocks.push({ kind: "warning", text: chunk.slice(3).trim() });
    } else if (chunk.startsWith("> ")) {
      blocks.push({ kind: "note", text: chunk.slice(2).trim() });
    } else if (lines.every((line) => line.startsWith("- "))) {
      blocks.push({ kind: "ul", items: lines.map((line) => line.slice(2).trim()) });
    } else if (lines.every((line) => /^\d+\.\s/.test(line))) {
      blocks.push({ kind: "ol", items: lines.map((line) => line.replace(/^\d+\.\s+/, "")) });
    } else {
      blocks.push({ kind: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}
