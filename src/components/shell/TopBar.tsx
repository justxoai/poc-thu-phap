import { Icon } from "@/components/ui/Icon";
import { SocialLinks } from "@/components/shell/SocialLinks";
import { site } from "@/config/site";

export function TopBar() {
  const { contact } = site;

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <ul className="topbar-contact">
          <li>
            <a href={`tel:${contact.phoneTel}`}>
              <Icon name="phone" size={16} />
              <span>{contact.phone}</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`}>
              <Icon name="mail" size={16} />
              <span>{contact.email}</span>
            </a>
          </li>
          <li className="topbar-address">
            <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" title="Xem trên Google Maps">
              <Icon name="map-pin" size={16} />
              <span>{contact.address}</span>
            </a>
          </li>
        </ul>
        <SocialLinks className="topbar-social" />
      </div>
    </div>
  );
}
