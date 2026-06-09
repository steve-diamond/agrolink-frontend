"use client";

import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/investor", label: "Investor Desk" },
  { href: "/loan-application", label: "Finance" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/about-us", label: "About Us" },
];

const partners = [
  { name: "Maize Growers", tag: "Crop Cooperative", image: "/agropro/images/maize.jpg" },
  { name: "Cassava Network", tag: "Root Value Chain", image: "/agropro/images/cassava.jpg" },
  { name: "Plantain Union", tag: "Fresh Produce", image: "/agropro/images/plantain.jpg" },
  { name: "Fish Farmers", tag: "Aquaculture Hub", image: "/agropro/images/fish.jpeg" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-green-700/70 bg-linear-to-b from-green-900 to-green-950 text-green-50" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]">
        <nav aria-labelledby="footer-links-heading">
          <h2 id="footer-links-heading" className="mb-4 text-2xl font-extrabold tracking-tight">Quick Links</h2>
          <ul className="grid gap-2 text-[1.02rem]">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex items-center text-green-100 transition-colors hover:text-amber-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 id="footer-contact-heading" className="mb-4 text-2xl font-extrabold tracking-tight">Contact Us</h2>
          <address aria-labelledby="footer-contact-heading" className="not-italic space-y-2 text-[1.02rem] text-green-100">
            <p><a href="mailto:info@dosagrolink.com.ng" className="transition-colors hover:text-amber-300">Email: info@dosagrolink.com.ng</a></p>
            <p><a href="tel:+2348129490467" className="transition-colors hover:text-amber-300">Phone: +234 812 949 0467</a></p>
            <p>Location: Lagos, Nigeria</p>
          </address>
          <nav aria-label="Social media links" className="mt-5 flex flex-wrap gap-4 text-green-100">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-300" aria-label="DosAgrolink on Facebook (opens in new tab)">Facebook</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-300" aria-label="DosAgrolink on LinkedIn (opens in new tab)">LinkedIn</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-300" aria-label="DosAgrolink on Instagram (opens in new tab)">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-300" aria-label="DosAgrolink on Twitter (opens in new tab)">Twitter</a>
          </nav>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Our Partners</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {partners.map((partner) => (
              <article key={partner.name} className="overflow-hidden rounded-lg border border-emerald-700/80 bg-green-950/55 shadow-[0_8px_18px_rgba(0,0,0,0.2)]">
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={220}
                  height={120}
                  className="h-18 w-full object-cover"
                />
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold leading-tight text-white">{partner.name}</p>
                  <p className="text-xs text-green-200">{partner.tag}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-green-700/80 pt-5 text-center text-green-100">
        <p className="text-[1.02rem]">© 2026 DosAgrolink. All Rights Reserved.</p>
        <p className="mt-2 text-[1.02rem]">Growing Together for a Prosperous Tomorrow</p>
      </div>
      </div>
    </footer>
  );
}
