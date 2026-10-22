import Image from "next/image";
import Link from "next/link";

import { services } from "@/config/site";

/** 6 lối vào dịch vụ: thẻ nền trắng không viền, tranh mực phủ kín thẻ (cover, căn giữa), tên dịch vụ chữ trắng đặt trên nét mực. */
export function ServiceBlocks() {
  return (
    <section className="services" aria-label="Dịch vụ">
      <div className="container">
        <ul className="service-grid">
          {services.map((service) => (
            <li key={service.label}>
              <Link href={service.href} className="service-tile">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 1000px) 380px, (min-width: 600px) 33vw, 50vw"
                />
                <span className="service-label">{service.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
