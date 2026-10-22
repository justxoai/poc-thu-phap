import { SocialLinks } from "@/components/shell/SocialLinks";
import { site } from "@/config/site";

export function TopBar() {
  const { contact } = site;

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <ul className="topbar-contact">
          <li>
            <a href={`tel:${contact.phoneTel}`}>{contact.phone}</a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          <li className="topbar-address">{contact.address}</li>
        </ul>
        <SocialLinks className="topbar-social" />
      </div>
    </div>
  );
}
