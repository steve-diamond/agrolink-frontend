import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nigeria Agricultural Marketplace - Verified Farm Products",
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

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
