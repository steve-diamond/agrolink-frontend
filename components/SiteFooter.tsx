"use client";

import Link from "next/link";

const quickLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/investor", label: "Investor Desk" },
  { href: "/loan-application", label: "Finance" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/about-us", label: "About Us" },
];

const partners = ["IFAD", "NIRSAL", "Access Bank", "CBN"];

export default function SiteFooter() {
  return (
    <footer className="mt-12 bg-green-900 py-10 text-white" aria-label="Site footer">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-6 md:grid-cols-3">
        <div>
          <h3 className="mb-4 font-bold">Quick Links</h3>
          <ul className="space-y-2">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-yellow-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Contact Us</h3>
          <p>Email: info@dosagrolink.com.ng</p>
          <p>Phone: +234 901 234 5678</p>
          <p>Location: Lagos, Nigeria</p>
          <div className="mt-4 flex space-x-4">
            <a href="#" className="hover:text-yellow-400">Facebook</a>
            <a href="#" className="hover:text-yellow-400">LinkedIn</a>
            <a href="#" className="hover:text-yellow-400">Instagram</a>
            <a href="#" className="hover:text-yellow-400">Twitter</a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Our Partners</h3>
          <div className="grid grid-cols-2 gap-4">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex h-16 items-center justify-center rounded-md border border-green-700 bg-green-950/40 px-2 text-center text-sm font-semibold"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-green-700 pt-4 text-center">
        <p>© 2026 DosAgrolink. All Rights Reserved.</p>
        <p className="mt-2">Growing Together for a Prosperous Tomorrow</p>
      </div>
    </footer>
  );
}
