import Image from "next/image";

import { SocialLinks } from "@/components/shell/SocialLinks";

/** Khối "theo dõi" dùng chung (hiện trong Footer; có thể đặt thêm ở nơi khác). */
export function FollowUs() {
  return (
    <div className="follow-us">
      <h2 className="footer-title">Theo dõi</h2>
      <SocialLinks className="follow-list" />
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
