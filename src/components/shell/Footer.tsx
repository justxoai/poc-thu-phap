import Image from "next/image";

import { SocialLinks } from "@/components/shell/SocialLinks";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/config/site";

/**
 * Footer gồm 2 tầng khác màu:
 * 1) Nền nâu đậm: thương hiệu + huy hiệu Bộ Công Thương | liên hệ + mạng xã hội | bản đồ.
 * 2) Thanh cuối nền xanh đậm: bản quyền.
 */
export function Footer() {
  const { contact } = site;

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <section aria-labelledby="footer-brand" className="footer-brand">
            <h2 id="footer-brand" className="footer-title">
              {site.name}
            </h2>
            <p>{site.about}</p>
            <Image className="follow-badge" src="/images/bo-cong-thuong.png" alt="Đã thông báo Bộ Công Thương" width={200} height={76} />
          </section>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="footer-title">
              Liên hệ
            </h2>
            <ul className="footer-contact">
              <li>
                <a href={`tel:${contact.phoneTel}`}>
                  <Icon name="phone" size={18} />
                  <span>{contact.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <Icon name="mail" size={18} />
                  <span>{contact.email}</span>
                </a>
              </li>
              <li>
                <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="map-pin" size={18} />
                  <span>{contact.address}</span>
                </a>
              </li>
            </ul>
            <h3 className="footer-subtitle">Theo dõi chúng tôi</h3>
            <SocialLinks className="follow-list" />
          </section>

          <section aria-labelledby="footer-map" className="footer-map-box">
            <h2 id="footer-map" className="footer-title">
              Bản đồ
            </h2>
            <div className="footer-map">
              <iframe
                src={contact.mapEmbedSrc}
                title="Bản đồ Việt Thư Đạo Quán"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        </div>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
