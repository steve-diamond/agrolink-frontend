"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getUSDRate } from "lib/fx";

type CampaignDetailClientProps = {
  campaignId: string;
};

type CampaignDetails = {
  id: string;
  title: string;
  cropType: string;
  farmerName: string;
  farmerBio: string;
  state: string;
  coverImageUrl: string;
  gallery: string[];
  raisedAmount: number;
  targetAmount: number;
  expectedReturnPct: number;
  durationMonths: number;
  minInvestment: number;
  investorCount: number;
  status: string;
};

export default function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [rate, setRate] = useState<number>(1500);
  const [projectedReturn, setProjectedReturn] = useState<number>(0);

  React.useEffect(() => {
    getUSDRate().then(setRate);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/invest/campaigns/${campaignId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load campaign details.");
        }

        const campaignData = payload?.data?.campaign as CampaignDetails;
        setCampaign(campaignData);
        setAmount(campaignData.minInvestment);
      } catch (error: unknown) {
        if ((error as Error).name !== "AbortError") {
          setLoadError(error instanceof Error ? error.message : "Failed to load campaign.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();

    return () => controller.abort();
  }, [campaignId]);

  React.useEffect(() => {
    if (!campaign) {
      setProjectedReturn(0);
      return;
    }

    const normalizedAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    setProjectedReturn(Number((normalizedAmount * (campaign.expectedReturnPct / 100)).toFixed(2)));
  }, [amount, campaign]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold text-green-800">Loading campaign details...</h1>
      </main>
    );
  }

  if (loadError || !campaign) {
    return (
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="mb-4 text-3xl font-bold text-green-800">Campaign not available</h1>
        <p className="text-red-700">{loadError || "This campaign could not be found."}</p>
      </main>
    );
  }

  const progressPct = campaign.targetAmount > 0
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
    : 0;
  const usdMin = Math.max(100, Math.ceil(campaign.minInvestment / rate));

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold text-green-800">{campaign.title}</h1>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {campaign.gallery.map((img, i) => (
          <Image key={i} src={img} alt={`${campaign.cropType} farm`} width={400} height={192} className="rounded-lg h-48 w-full object-cover" />
        ))}
      </div>
      {/* Farmer Bio & Location */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-green-800 mb-2">{campaign.cropType} Farm</h2>
          <p className="text-gray-700 mb-2">By {campaign.farmerName} ({campaign.state})</p>
          <p className="text-gray-600 mb-2">{campaign.farmerBio}</p>
          <div className="text-xs text-gray-500">Status: {campaign.status}</div>
        </div>
        <div className="w-full md:w-64 rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Funding progress</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">{progressPct}% funded</div>
          <progress
            className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-green-600 [&::-moz-progress-bar]:bg-green-600"
            value={progressPct}
            max={100}
            aria-label="Funding progress"
          />
          <p className="text-xs text-gray-600 mt-2">
            ₦{campaign.raisedAmount.toLocaleString()} raised of ₦{campaign.targetAmount.toLocaleString()}
          </p>
        </div>
      </div>
      {/* Financials */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{campaign.expectedReturnPct}% p.a.</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{campaign.durationMonths} mo</span>
          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">Min ₦{campaign.minInvestment.toLocaleString()}</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{campaign.investorCount} investors</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <label htmlFor="investment-amount" className="font-semibold">Investment Amount:</label>
          <input
            id="investment-amount"
            type="number"
            min={currency === "USD" ? usdMin : campaign.minInvestment}
            className="border rounded px-2 py-1 w-32"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Investment amount"
          />
          <select
            id="investment-currency"
            className="border rounded px-2 py-1"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "NGN" | "USD")}
            aria-label="Investment currency"
          >
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
          </select>
          <span className="text-xs text-gray-500">1 USD ≈ ₦{rate}</span>
        </div>
        <div className="text-green-700 font-bold mb-2">
          Projected Return: {currency === "USD" ? "$" : "₦"}{projectedReturn.toLocaleString()}
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition">
          Proceed to Payment
        </button>
        <div className="text-xs text-gray-400 mt-2">Powered by Paystack</div>
      </div>
    </main>
  );
}
