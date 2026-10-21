import Image from "next/image";
import Link from "next/link";

import { mainNav, site } from "@/config/site";

import { NavMenu } from "./NavMenu";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${site.name} - Trang chủ`}>
          <Image src="/images/logo.jpg" alt="" width={56} height={56} priority />
          <span className="brand-text">{site.name}</span>
        </Link>
        <NavMenu items={mainNav} />
      </div>
    </header>
  );
}
