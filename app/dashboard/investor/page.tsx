import React from "react";

// Placeholder data
const portfolio = {
  totalInvested: 4200000,
  expectedReturns: 780000,
  activeCampaigns: 2,
  matured: 1,
};
const investments = [
  {
    id: "1",
    campaign: "Benue Maize",
    amount: 2000000,
    currency: "NGN",
    status: "active",
    expectedReturn: 360000,
    maturity: "2026-12-01",
  },
  {
    id: "2",
    campaign: "Kano Rice",
    amount: 2200000,
    currency: "NGN",
    status: "matured",
    expectedReturn: 420000,
    maturity: "2025-11-01",
  },
];
const updates = [
  { id: "u1", title: "Planting Complete", body: "All seeds planted.", date: "2026-04-10" },
  { id: "u2", title: "Rainfall Update", body: "Good rainfall this week.", date: "2026-04-15" },
];
const payouts = [
  { id: "p1", amount: 420000, currency: "NGN", date: "2025-12-10" },
];

export default function InvestorDashboard() {
  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-800">My Investments</h1>
      {/* Portfolio Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">₦{portfolio.totalInvested.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Total Invested</div>
        </div>
        <div className="bg-green-50 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">₦{portfolio.expectedReturns.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Expected Returns</div>
        </div>
        <div className="bg-green-50 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">{portfolio.activeCampaigns}</div>
          <div className="text-xs text-gray-600">Active Campaigns</div>
        </div>
        <div className="bg-green-50 p-4 rounded shadow text-center">
          <div className="text-lg font-bold">{portfolio.matured}</div>
          <div className="text-xs text-gray-600">Matured</div>
        </div>
      </section>
      {/* Investment Table */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Investments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="py-2 px-4">Campaign</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Expected Return</th>
                <th className="py-2 px-4">Maturity</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id} className="text-center">
                  <td className="py-2 px-4">{inv.campaign}</td>
                  <td className="py-2 px-4">{inv.currency === 'USD' ? '$' : '₦'}{inv.amount.toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{inv.status}</span>
                  </td>
                  <td className="py-2 px-4">₦{inv.expectedReturn.toLocaleString()}</td>
                  <td className="py-2 px-4">{inv.maturity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Progress Updates */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Progress Updates</h2>
        <ul className="space-y-2">
          {updates.map(u => (
            <li key={u.id} className="bg-white rounded shadow p-3">
              <div className="font-semibold text-green-800">{u.title}</div>
              <div className="text-gray-700 text-sm">{u.body}</div>
              <div className="text-xs text-gray-400">{u.date}</div>
            </li>
          ))}
        </ul>
      </section>
      {/* Payout History */}
      <section>
        <h2 className="text-lg font-bold mb-2">Payout History</h2>
        <ul className="space-y-2">
          {payouts.map(p => (
            <li key={p.id} className="bg-white rounded shadow p-3 flex justify-between items-center">
              <span>Payout: {p.currency === 'USD' ? '$' : '₦'}{p.amount.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{p.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
