import type { Metadata } from "next";
import CampaignDetailClient from "./CampaignDetailClient";
import { absoluteUrl, breadcrumbSchema, pageMetadata } from "@/lib/seo";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
  const { campaignId } = await params;

  return pageMetadata({
    title: `Agribusiness Investment Campaign ${campaignId} | DOS AGROLINK`,
    description:
      "Review campaign performance, expected returns, investor activity, and payout timeline for this verified DOS Agrolink agribusiness investment opportunity.",
    path: `/invest/${campaignId}`,
    keywords: [
      "agribusiness investment nigeria",
      "farm investment campaign",
      "dos agrolink investors",
      campaignId,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignBreadcrumb) }}
      />
      <CampaignDetailClient campaignId={campaignId} />
    </>
  );
}
