"use client";

import React from "react";

type CampaignDetailClientProps = {
  campaignId: string;
};

export default function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <section className="rounded-xl border border-dashed border-green-300 bg-green-50 p-6 text-green-900">
        <h1 className="text-2xl font-bold mb-2">Campaign details unavailable</h1>
        <p className="mb-2">
          Campaign <span className="font-semibold">{campaignId}</span> is not published yet or the investment data service is still being connected.
        </p>
        <p className="text-sm text-green-800">Please check back shortly.</p>
      </section>
    </main>
  );
}
