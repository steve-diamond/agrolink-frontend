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

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const normalizedDescription = truncateDescription(input.description);
  const url = absoluteUrl(input.path);
  const imageUrl = absoluteUrl(siteConfig.ogImage);

  return {
    title: input.title,
    description: normalizedDescription,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: input.title,
      description: normalizedDescription,
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
      description: normalizedDescription,
      creator: siteConfig.twitterHandle,
      images: [imageUrl],
    },
  };
}

export function truncateDescription(description: string, maxLength = 155) {
  const clean = description.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
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

export function aggregateReviewSchema(input: {
  name: string;
  url: string;
  ratingValue: string;
  ratingCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Organization",
      name: input.name,
      url: input.url,
    },
    ratingValue: input.ratingValue,
    bestRating: "5",
    ratingCount: input.ratingCount,
  };
}

export function productSchema(input: {
  name: string;
  description: string;
  image: string;
  category: string;
  seller: string;
  price: number;
  currency?: string;
  url: string;
  availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
  ratingValue?: string;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    image: input.image,
    description: truncateDescription(input.description, 240),
    category: input.category,
    brand: {
      "@type": "Brand",
      name: input.seller,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: input.currency ?? "NGN",
      price: input.price,
      availability: input.availability,
      url: input.url,
    },
    ...(input.ratingValue && input.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: input.ratingValue,
            reviewCount: input.reviewCount,
          },
        }
      : {}),
  };
}
