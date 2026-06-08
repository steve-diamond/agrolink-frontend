import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { absoluteUrl, aggregateReviewSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nigerian Agribusiness Marketplace, Loans and Logistics | DOS AGROLINK",
  description:
    "Trade crops, access farmer loans, manage logistics, and invest in verified Nigerian agribusiness opportunities on DOS AGROLINK.",
  path: "/",
  keywords: [
    "Nigerian agriculture marketplace",
    "farmer loans Nigeria",
    "agribusiness logistics",
    "crop trading platform",
    "warehouse services Nigeria",
  ],
});

const homeBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", url: absoluteUrl("/") },
]);

const homeReviewSchema = aggregateReviewSchema({
  name: "DOS AGROLINK NIGERIA",
  url: absoluteUrl("/"),
  ratingValue: "4.8",
  ratingCount: 240,
});

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeReviewSchema) }}
      />
      <HomePageClient />
    </>
  );
}
