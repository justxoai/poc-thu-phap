import Image from "next/image";

import { site } from "@/config/site";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Image
        src="/images/banner.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-bg"
      />
      <div className="container hero-inner">
        <h1 id="hero-title" className="hero-title">
          <span className="hero-title-accent">THANH</span> PHONG THƯ MÔN
        </h1>
        <p className="hero-desc">{site.description}</p>
      </div>
    </section>
  );
}
