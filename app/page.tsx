import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { absoluteUrl, breadcrumbSchema, faqPageSchema, pageMetadata, reviewSchema } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nigerian Agribusiness Marketplace, Loans and Logistics | DOS AGROLINK",
  description:
    "Trade crops, access farmer loans, manage logistics, and invest in verified Nigerian agribusiness opportunities with transparent pricing on DOS AGROLINK.",
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

const homeReviewSchema = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  itemReviewed: {
    "@type": "Organization",
    name: "DOS AGROLINK NIGERIA",
    url: absoluteUrl("/"),
  },
  ratingValue: "4.8",
  bestRating: "5",
  ratingCount: 240,
};

const testimonialReviewSchema = reviewSchema({
  itemName: "DOS AGROLINK NIGERIA",
  itemType: "Organization",
  itemPath: "/",
  authorName: "Adebayo, Ondo State",
  ratingValue: 5,
  reviewBody:
    "DOS AGROLINK helped me reach verified buyers, reduce losses, and improve price confidence across planting and harvest cycles.",
});

const homeFaqSchema = faqPageSchema([
  {
    question: "How does DOS AGROLINK help farmers get better prices?",
    answer:
      "DOS AGROLINK connects farmers with verified buyers and provides pricing visibility so sellers can compare demand and make better trading decisions.",
  },
  {
    question: "Can I apply for agricultural loans on DOS AGROLINK?",
    answer:
      "Yes. Farmers and cooperatives can apply for loans through the platform and track application progress with transparent repayment information.",
  },
  {
    question: "Does DOS AGROLINK support logistics and warehousing?",
    answer:
      "Yes. The platform supports produce movement and warehouse services to reduce post-harvest loss and improve fulfillment reliability.",
  },
]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialReviewSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <HomePageClient />
    </>
  );
}
