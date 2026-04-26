"use client";
import React, { useState } from "react";
import Image from 'next/image';
import { getUSDRate } from "lib/fx";

// Placeholder for campaign data fetching
const campaign = {
  id: "demo",
  cover_image_url: "/public/farm-demo.jpg",
  gallery: ["/public/farm-demo.jpg", "/public/farm-demo2.jpg"],
  crop_type: "Maize",
  farmer_name: "A. Okafor",
  farmer_bio: "Experienced maize farmer in Benue.",
  state: "Benue",
  location: { lat: 7.336, lng: 8.740 },
  raised_amount: 1200000,
  target_amount: 2000000,
  expected_return_pct: 18,
  duration_months: 10,
  min_investment: 150000,
  investor_count: 42,
  status: "active",
};

export default function CampaignDetailPage() {
  const [amount, setAmount] = useState(150000);
  const [currency, setCurrency] = useState<'NGN'|'USD'>('NGN');
  const [rate, setRate] = useState<number>(1500);
  const [projectedReturn, setProjectedReturn] = useState<number>(0);

  React.useEffect(() => {
    getUSDRate().then(setRate);
  }, []);

  React.useEffect(() => {
    const amt = currency === 'USD' ? amount : amount / rate;
    setProjectedReturn(Number((amt * (campaign.expected_return_pct/100)).toFixed(2)));
  }, [amount, currency, rate]);

  return (
    <main className="max-w-4xl mx-auto py-8">
      {/* Gallery */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {campaign.gallery.map((img, i) => (
          <Image key={i} src={img} alt="Farm" width={400} height={192} className="rounded-lg h-48 w-full object-cover" />
        ))}
      </div>
      {/* Farmer Bio & Location */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-green-800 mb-2">{campaign.title || campaign.crop_type} Farm</h2>
          <p className="text-gray-700 mb-2">By {campaign.farmer_name} ({campaign.state})</p>
          <p className="text-gray-600 mb-2">{campaign.farmer_bio}</p>
          <div className="text-xs text-gray-500">Farm Size: {campaign.farm_size_ha || 2.5} ha</div>
        </div>
        <div className="w-full md:w-64 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
          {/* Static map placeholder */}
          <span className="text-gray-500">[Map: {campaign.state}]</span>
        </div>
      </div>
      {/* Financials */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{campaign.expected_return_pct}% p.a.</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{campaign.duration_months} mo</span>
          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">Min ₦{campaign.min_investment.toLocaleString()}</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{campaign.investor_count} investors</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <label className="font-semibold">Investment Amount:</label>
          <input
            type="number"
            min={currency === 'USD' ? 100 : 150000}
            className="border rounded px-2 py-1 w-32"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          <select
            className="border rounded px-2 py-1"
            value={currency}
            onChange={e => setCurrency(e.target.value as 'NGN'|'USD')}
          >
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
          </select>
          <span className="text-xs text-gray-500">1 USD ≈ ₦{rate}</span>
        </div>
        <div className="text-green-700 font-bold mb-2">
          Projected Return: {currency === 'USD' ? '$' : '₦'}{projectedReturn.toLocaleString()}
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition">
          Proceed to Payment
        </button>
        <div className="text-xs text-gray-400 mt-2">Powered by Paystack</div>
      </div>
    </main>
  );
}
