import type { Metadata } from "next";

export const siteConfig = {
  name: "DOS AGROLINK NIGERIA",
  shortName: "DosAgrolink",
  description:
    "DOS Agrolink connects Nigerian farmers, buyers, and investors with transparent agribusiness finance, marketplace trading, logistics, and warehousing.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dosagrolink.ng",
  logo: "/dos-agrolink-logo.png",
  ogImage: "/agropro/images/banner.jpg",
  twitterHandle: "@dosagrolink",
  locale: "en_NG",
} as const;

export function absoluteUrl(pathname = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

function truncateDescription(value: string, maxLength = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
}): Metadata {
  const url = absoluteUrl(input.path);
  const imageUrl = absoluteUrl(input.imagePath || siteConfig.ogImage);
  const description = truncateDescription(input.description);

  return {
    title: input.title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: input.title,
      description,
      url,
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.shortName} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      creator: siteConfig.twitterHandle,
      images: [imageUrl],
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    sameAs: [
      "https://www.facebook.com/",
      "https://www.linkedin.com/",
      "https://x.com/",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "NG",
        availableLanguage: ["English", "Hausa", "Yoruba", "Igbo", "Nigerian Pidgin"],
      },
    ],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productSchema(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  category?: string;
  sku?: string;
  price?: number;
  currency?: string;
  availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: truncateDescription(input.description, 300),
    image: input.image ? [input.image] : [absoluteUrl(siteConfig.ogImage)],
    category: input.category,
    sku: input.sku,
    url: absoluteUrl(input.path),
    brand: {
      "@type": "Brand",
      name: siteConfig.shortName,
    },
    offers:
      typeof input.price === "number"
        ? {
            "@type": "Offer",
            url: absoluteUrl(input.path),
            priceCurrency: input.currency || "NGN",
            price: input.price,
            availability: input.availability || "https://schema.org/InStock",
          }
        : undefined,
    aggregateRating: input.aggregateRating
      ? {
          "@type": "AggregateRating",
          ratingValue: input.aggregateRating.ratingValue,
          reviewCount: input.aggregateRating.reviewCount,
        }
      : undefined,
  };
}

export function reviewSchema(input: {
  itemName: string;
  itemType?: "Service" | "Product" | "Organization";
  reviewBody: string;
  ratingValue: number;
  authorName: string;
  itemPath?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": input.itemType || "Service",
      name: input.itemName,
      url: input.itemPath ? absoluteUrl(input.itemPath) : undefined,
    },
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(input.ratingValue),
      bestRating: "5",
    },
    reviewBody: input.reviewBody,
  };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
