import Image from "next/image";
import Link from "next/link";

import { portalTiles } from "@/config/site";

export function PortalSection() {
  return (
    <section className="portal" aria-labelledby="portal-title">
      {/* Next báo ảnh này là LCP: nạp sớm (eager) nhưng ưu tiên thấp để không giành băng thông với banner đầu trang. */}
      <Image src="/images/hoc-online-bg.jpg" alt="" fill sizes="100vw" className="portal-bg" loading="eager" fetchPriority="low" />
      <div className="container portal-inner">
        <h2 id="portal-title" className="portal-title">
          Học online miễn phí
        </h2>
        <hr className="portal-sep" />
        <p className="portal-intro">
          Khám phá các không gian học tập và hoạt động của Thanh Phong Thư Môn.
        </p>
        <ul className="portal-grid">
          {portalTiles.map((tile) => (
            <li key={tile.href}>
              <Link href={tile.href} className="portal-tile">
                <span className="portal-thumb">
                  <Image src={tile.image} alt="" width={160} height={160} />
                </span>
                <span className="portal-label">{tile.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
