import type { Metadata } from "next";
import InputDetailClient from "./InputDetailClient";
import { absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";

type InputDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: InputDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return pageMetadata({
    title: `Agricultural Input ${id} | DOS AGROLINK Marketplace`,
    description:
      "Explore specifications, seller details, and fulfillment options for this verified agricultural input listing on the DOS Agrolink marketplace.",
    path: `/inputs/${id}`,
    keywords: [
      "agricultural inputs nigeria",
      "farm supplies marketplace",
      "dos agrolink inputs",
      id,
    ],
  });
}

export default async function InputDetailPage({ params }: InputDetailPageProps) {
  const { id } = await params;

  const inputBreadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Inputs", url: absoluteUrl("/inputs") },
    { name: `Input ${id}`, url: absoluteUrl(`/inputs/${id}`) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(inputBreadcrumb) }}
      />
      <InputDetailClient id={id} />
    </>
  );
}
