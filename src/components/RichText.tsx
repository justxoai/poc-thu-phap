import Link from "next/link";
import type { ReactNode } from "react";

import { isInternalHref, siteLink } from "@/lib/links";

/** Hiển thị chuỗi có ký hiệu rút gọn: **chữ đậm** và [nhãn](đường dẫn). Không chèn HTML thô. */
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      const href = siteLink(match[3]);
      nodes.push(
        isInternalHref(href) ? (
          <Link key={key++} href={href}>
            {match[2]}
          </Link>
        ) : (
          <a key={key++} href={href}>
            {match[2]}
          </a>
        ),
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

/** Liên kết/nút dùng đường dẫn cũ hoặc mới: tự chọn <Link> hay <a>. */
export function SiteAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const target = siteLink(href);
  return isInternalHref(target) ? (
    <Link href={target} className={className}>
      {children}
    </Link>
  ) : (
    <a href={target} className={className}>
      {children}
    </a>
  );
}
