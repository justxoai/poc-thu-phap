import { Icon } from "@/components/ui/Icon";
import { site } from "@/config/site";

/** Liên kết mạng xã hội dưới dạng icon (Instagram, YouTube, Facebook, Twitter). Dùng chung ở TopBar, Footer, thanh bên. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={className ? `social-links ${className}` : "social-links"} aria-label="Mạng xã hội">
      {site.socials.map((social) => (
        <li key={social.name}>
          <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} title={social.name}>
            <Icon name={social.icon} size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
