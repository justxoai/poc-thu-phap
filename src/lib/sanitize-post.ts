import sanitizeHtml from "sanitize-html";

/**
 * Lọc HTML bài viết trước khi hiển thị. Danh sách cho phép (allowlist): mọi thẻ/thuộc tính ngoài danh sách đều bị bỏ.
 *  - Không cho phép <script>, trình xử lý sự kiện (onclick...), javascript:, form, object/embed.
 *  - iframe chỉ nhận YouTube (youtube-nocookie.com, youtube.com).
 *  - Ảnh và liên kết chỉ nhận https (liên kết còn nhận mailto, tel).
 *  - Thẻ <style> của bài cũ vẫn được giữ (chưa được giới hạn phạm vi): CHỈ dùng cho nội dung do chủ site soạn.
 */
const IFRAME_HOSTS = ["www.youtube-nocookie.com", "www.youtube.com"];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "a", "abbr", "b", "blockquote", "br", "caption", "code", "col", "colgroup", "dd", "del", "div", "dl", "dt", "em", "figcaption", "figure",
    "h2", "h3", "h4", "h5", "h6", "hr", "i", "iframe", "img", "li", "ol", "p", "pre", "s", "small", "span", "strong", "style", "sub", "sup",
    "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "width", "height", "loading", "title"],
    iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    "*": ["class", "id", "style"],
  },
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"], iframe: ["https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: IFRAME_HOSTS,
  // Chỉ cho phép một số thuộc tính CSS an toàn trong style="...": không có position/url()/expression.
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      "text-align": [/^(left|right|center|justify)$/],
      "font-size": [/^[\d.]+(px|em|rem|%|pt)$/],
      "font-weight": [/^(normal|bold|[1-9]00)$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^(none|underline|line-through)$/],
      "line-height": [/^[\d.]+(px|em|rem|%)?$/],
      margin: [/^[\d.\s]+(px|em|rem|%)?(\s+[\d.]+(px|em|rem|%)?){0,3}$/],
      padding: [/^[\d.\s]+(px|em|rem|%)?(\s+[\d.]+(px|em|rem|%)?){0,3}$/],
      width: [/^[\d.]+(px|em|rem|%)$/],
      "max-width": [/^[\d.]+(px|em|rem|%)$/],
      height: [/^[\d.]+(px|em|rem|%)$/],
      "border-radius": [/^[\d.]+(px|em|rem|%)$/],
    },
  },
  // Cần để giữ <style> trong bài. Rủi ro đã nêu ở đầu tệp.
  allowVulnerableTags: true,
  transformTags: {
    a: (tag: string, attribs: Record<string, string>) => {
      const external = /^https?:/i.test(attribs.href ?? "");
      return { tagName: tag, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
    },
    img: (tag: string, attribs: Record<string, string>) => ({ tagName: tag, attribs: { ...attribs, loading: "lazy" } }),
  },
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
