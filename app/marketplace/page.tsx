import type { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient";
import { absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nigeria Agricultural Marketplace - Verified Farm Products | DOS AGROLINK",
  description:
    "Buy and sell verified agricultural products in Nigeria with transparent prices, trusted seller ratings, and secure marketplace checkout.",
  path: "/marketplace",
  keywords: [
    "agriculture marketplace nigeria",
    "verified farm products",
    "crop buyers and sellers",
    "farmer e-commerce",
    "nigeria produce prices",
  ],
});

export default function MarketplacePage() {
  const marketplaceBreadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Marketplace", url: absoluteUrl("/marketplace") },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceBreadcrumb) }}
      />
      <MarketplaceClient />
    </>
  );
}
