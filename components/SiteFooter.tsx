"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">
        <p>DOS AGROLINK NIGERIA</p>
        <div className="site-footer-links" aria-label="Platform quick links">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
