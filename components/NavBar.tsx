"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dosLogo from "../dos logo.jpg";
import { isRouteActive } from "@/lib/navigationActive";

export default function NavBar() {
  const pathname = usePathname();

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/loan-application", label: "Finance" },
    { href: "/logistics", label: "Logistics" },
    { href: "/warehouse", label: "Warehouse" },
    { href: "/investor", label: "Investor Desk" },
    { href: "/about-us", label: "About Us" },
  ];

  return (
    <header>
      <div className="dos-topbar">
        <Link href="/" className="dos-brand" aria-label="Go to homepage">
          <Image src={dosLogo} alt="DosAgrolink" width={26} height={26} className="dos-brand-logo" />
          <strong>DosAgrolink</strong>
        </Link>

        <nav className="dos-menu" aria-label="Primary">
          {primaryLinks.map((item, index) => (
            <span key={item.href} className="flex items-center gap-2">
              <Link
                href={item.href}
                className={isRouteActive(pathname, item.href) ? "active-nav-link" : undefined}
              >
                {item.label}
              </Link>
              {index < primaryLinks.length - 1 ? <span className="opacity-65">•</span> : null}
            </span>
          ))}
        </nav>
      </div>

      <div className="dos-subbar">
        <div className="dos-subbar-contact" aria-label="Contact and language">
          <span>Call Us</span>
          <span>|</span>
          <span>WhatsApp</span>
          <span>|</span>
          <span>En · Yo · Ig·Ha</span>
        </div>
        <div className="dos-subbar-cta-wrap">
          <Link href="/register" className="dos-get-started">Get Started</Link>
        </div>
      </div>
    </header>
  );
}
