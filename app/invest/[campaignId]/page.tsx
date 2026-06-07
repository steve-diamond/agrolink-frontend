import type { Metadata } from "next";
import CampaignDetailClient from "./CampaignDetailClient";
import { absoluteUrl, breadcrumbSchema, pageMetadata, productSchema } from "@/lib/seo";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
  const { campaignId } = await params;

  return pageMetadata({
    title: `Agriculture Investment Campaign ${campaignId} | DOS AGROLINK`,
    description:
      "Review campaign performance, expected returns, and risk signals before investing in verified Nigerian farm projects on DOS AGROLINK.",
    path: `/invest/${campaignId}`,
    keywords: [
      "farm investment Nigeria",
      "agriculture crowdfunding",
      "nigerian agribusiness returns",
      "verified farm campaign",
    ],
  });
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params;

  const campaignBreadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Invest", url: absoluteUrl("/invest") },
    { name: `Campaign ${campaignId}`, url: absoluteUrl(`/invest/${campaignId}`) },
  ]);

  const campaignProductSchema = productSchema({
    name: `Farm Investment Campaign ${campaignId}`,
    description:
      "Agricultural investment opportunity with projected returns, verified farm details, and transparent campaign milestones.",
    path: `/invest/${campaignId}`,
    category: "Agriculture Investment",
    sku: campaignId,
    aggregateRating: {
      ratingValue: 4.8,
      reviewCount: 42,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignProductSchema) }}
      />
      <CampaignDetailClient campaignId={campaignId} />
    </>
  );
}
