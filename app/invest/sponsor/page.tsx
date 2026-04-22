import React from "react";
import FarmCampaignCard from "components/invest/FarmCampaignCard";

const stats = [
  { label: "₦2.4B invested" },
  { label: "3,400 farmers funded" },
  { label: "Avg 18% annual return" },
];

const steps = [
  "Choose a Farm",
  "Invest from $100/₦150,000",
  "Receive quarterly reports",
  "Earn returns at harvest (12-24% p.a.)",
];

export default function SponsorLandingPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-b from-green-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">Grow Wealth. Feed Nigeria.</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">Invest from anywhere. Earn returns in USD or Naira. Fund real farms.</p>
        <div className="flex justify-center gap-6 mb-8">
          {stats.map((s, i) => (
            <span key={i} className="text-base md:text-lg font-semibold text-green-700 bg-green-100 rounded-full px-4 py-1">
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto py-8">
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">How It Works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <li key={i} className="bg-white shadow rounded-lg p-4 flex flex-col items-center">
              <span className="text-3xl font-bold text-green-600 mb-2">{i + 1}</span>
              <span className="text-center text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Risk Disclosure */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="bg-amber-100 border-l-4 border-amber-400 text-amber-800 p-4 rounded shadow">
          <strong>Agricultural investments carry risk.</strong> Returns are not guaranteed. DosAgrolink is registered with CAC.
        </div>
      </section>

      {/* Active Farm Campaigns */}
      <section className="max-w-6xl mx-auto py-8">
        <h2 className="text-xl font-bold text-green-800 mb-6">Active Farm Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* TODO: Map over real campaigns from Supabase */}
          {[1,2,3].map((id) => (
            <FarmCampaignCard key={id} /* campaign={campaign} */ />
          ))}
        </div>
      </section>
    </main>
  );
}
