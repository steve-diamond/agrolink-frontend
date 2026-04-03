"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isRouteActive } from "@/lib/navigationActive";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Farmer Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/product-listing", label: "Product Listing" },
  { href: "/order-management", label: "Order Management" },
  { href: "/loan-application", label: "Loan Application" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/equipment-listing", label: "Equipment Listing" },
  { href: "/about-us", label: "About Us" },
  { href: "/investor", label: "Investor" },
  { href: "/admin/login", label: "Admin Dashboard" },
];

export default function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-wrap">
        <div className="site-footer-top">
          <div>
            <span>Call Us</span>
            <p>+234 700 DOS AGRI</p>
          </div>
          <div>
            <span>Email</span>
            <p>hello@dosagrolink.ng</p>
          </div>
          <div>
            <span>Head Office</span>
            <p>Abuja, Nigeria. Expanding across all agricultural zones.</p>
          </div>
        </div>

        <div className="site-footer-main">
          <div>
            <h3>DOS AGROLINK NIGERIA</h3>
            <p className="site-footer-tagline">From farm value to market strength.</p>
          </div>

          <div>
            <h4>About</h4>
            <div className="site-footer-links" aria-label="About links">
              <Link href="/about-us">Our Story</Link>
              <Link href="/investor">Our Vision</Link>
              <Link href="/loan-application">Farmer Growth</Link>
              <Link href="/warehouse">Storage Strategy</Link>
            </div>
          </div>

          <div>
            <h4>Platform</h4>
            <div className="site-footer-links" aria-label="Platform links">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className={isRouteActive(pathname, item.href) ? "active-footer-link" : undefined}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4>Subscribe</h4>
            <form className="site-footer-subscribe" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter email address" aria-label="Enter email address" />
              <button type="submit">Subscribe</button>
            </form>
            <p className="site-footer-note">Get updates on pricing insights, logistics rollout, and market opportunities.</p>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>Copyright {new Date().getFullYear()} DOS AGROLINK NIGERIA. All rights reserved.</p>
          <div>
            <Link href="/about-us" aria-label="About DOS AGROLINK">A</Link>
            <Link href="/marketplace" aria-label="Marketplace">M</Link>
            <Link href="/investor" aria-label="Investor">I</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
