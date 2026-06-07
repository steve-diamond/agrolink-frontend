import type { Metadata } from "next";
import InputDetailsClient from "./InputDetailsClient";
import { absoluteUrl, breadcrumbSchema, pageMetadata, productSchema } from "@/lib/seo";

type InputDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: InputDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  return pageMetadata({
    title: `Farm Input ${id} | Marketplace Listing | DOS AGROLINK`,
    description:
      "View farm input details, pricing context, and listing information for seeds, fertilizers, and equipment on DOS AGROLINK.",
    path: `/inputs/${id}`,
    keywords: [
      "farm inputs Nigeria",
      "agricultural supplies marketplace",
      "seed fertilizer listing",
      "farm equipment catalog",
    ],
  });
}

export default async function InputDetailsPage({ params }: InputDetailsPageProps) {
  const { id } = await params;

  const inputBreadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Inputs", url: absoluteUrl("/inputs") },
    { name: `Input ${id}`, url: absoluteUrl(`/inputs/${id}`) },
  ]);

  const inputProductSchema = productSchema({
    name: `Farm Input ${id}`,
    description:
      "Agricultural input listing for seeds, fertilizers, crop protection products, or equipment available in the DOS AGROLINK marketplace.",
    path: `/inputs/${id}`,
    category: "Agricultural Inputs",
    sku: id,
    aggregateRating: {
      ratingValue: 4.7,
      reviewCount: 31,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(inputBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(inputProductSchema) }}
      />
      <InputDetailsClient id={id} />
    </>
  );
}
