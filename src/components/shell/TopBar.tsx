import { site } from "@/config/site";

export function TopBar() {
  const { contact, socials } = site;

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
        <ul className="topbar-social" aria-label="Mạng xã hội">
          {socials.map((social) => (
            <li key={social.name}>
              <a href={social.href} target="_blank" rel="noopener noreferrer">
                {social.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
