import React from "react";

export default function InvestorDashboard() {
  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-green-800">My Investments</h1>
      <section className="rounded-xl border border-dashed border-green-300 bg-green-50 p-6 text-green-900">
        <p className="font-semibold mb-2">Investor portfolio is not available yet.</p>
        <p className="text-sm">
          Live campaign, update, and payout records will appear here after the investor data service is connected.
        </p>
      </section>
    </main>
  );
}
