import Image from "next/image";

import { site } from "@/config/site";

/** Khối "theo dõi" dùng chung (hiện trong Footer; có thể đặt thêm ở nơi khác). */
export function FollowUs() {
  return (
    <div className="follow-us">
      <h2 className="footer-title">Theo dõi</h2>
      <ul className="follow-list">
        {site.socials.map((social) => (
          <li key={social.name}>
            <a href={social.href} target="_blank" rel="noopener noreferrer">
              {social.name}
            </a>
          </li>
        ))}
      </ul>
      <Image
        className="follow-badge"
        src="/images/bo-cong-thuong.png"
        alt="Bộ Công Thương"
        width={121}
        height={46}
      />
    </div>
  );
}
