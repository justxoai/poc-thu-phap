import Link from "next/link";

import { services } from "@/config/site";

export function ServiceBlocks() {
  return (
    <section className="container section" aria-label="Dịch vụ">
      <ul className="service-grid">
        {services.map((service) => (
          <li key={service.label}>
            <Link href={service.href} className="service-tile">
              <span>{service.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
