"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isRouteActive } from "@/lib/navigationActive";

const footerLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/loan-application", label: "Finance" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/investor", label: "Investor Desk" },
  { href: "/about-us", label: "About Us" },
];

export default function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="dos-footer" aria-label="Site footer">
      <div className="dos-topbar">
        <div className="dos-brand">
          <strong>DosAgrolink</strong>
        </div>

        <nav className="dos-menu" aria-label="Footer navigation">
          {footerLinks.map((item, index) => (
            <span key={item.href} className="flex items-center gap-2">
              <Link href={item.href} className={isRouteActive(pathname, item.href) ? "active-nav-link" : undefined}>
                {item.label}
              </Link>
              {index < footerLinks.length - 1 ? <span className="opacity-65">•</span> : null}
            </span>
          ))}
        </nav>
      </div>

      <div className="dos-subbar">
        <div className="dos-subbar-contact" aria-label="Footer utilities">
          <span>Call Us</span>
          <span>|</span>
          <span>WhatsApp</span>
          <span>|</span>
          <span>hello@dosagrolink.ng</span>
        </div>
        <div className="dos-subbar-cta-wrap">
          <span className="dos-footer-copy">Copyright {new Date().getFullYear()} DosAgrolink</span>
          <Link href="/register" className="dos-get-started">Get Started</Link>
        </div>
      </div>
    </footer>
  );
}
