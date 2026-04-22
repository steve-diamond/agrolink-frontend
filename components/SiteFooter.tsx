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
          <p>Phone: +2348129490467</p>
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
              <article key={partner.name} className="overflow-hidden rounded-md border border-green-700 bg-green-950/40">
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={220}
                  height={120}
                  className="h-16 w-full object-cover"
                />
                <div className="px-2 py-1">
                  <p className="text-xs font-semibold leading-tight">{partner.name}</p>
                  <p className="text-[10px] text-green-200">{partner.tag}</p>
                </div>
              </article>
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
