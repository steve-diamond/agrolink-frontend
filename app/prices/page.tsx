"use client";
import React, { useState } from 'react';
import PriceCard, { PriceCardProps } from 'components/prices/PriceCard';
import dynamic from 'next/dynamic';
import { usePrices } from '../../lib/hooks/usePrices';

const PriceAlertToggle = dynamic(() => import('./PriceAlertToggle'), { ssr: false });

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
const COMMODITIES = [
  'Maize', 'Cassava', 'Yam', 'Plantain', 'Tomato', 'Pepper', 'Rice (local)', 'Soya Beans', 'Palm Oil', 'Catfish', 'Broiler Chicken', 'Ugu (Pumpkin Leaf)'
];

export default function LiveMarketPricesPage() {
  const [state, setState] = useState('');
  const [commodity, setCommodity] = useState('');
  const { data: prices, isPending } = usePrices({ state: state || undefined, commodity: commodity || undefined });

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      {/* Hero Banner */}
      <header className="bg-[#2D6A4F] text-white py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Live Market Intelligence</h1>
        <p className="text-lg opacity-90">Updated every 6 hours from verified aggregators</p>
      </header>

      <main id="main-content" tabIndex={-1}>
      {/* Filter Bar */}
      <div className="bg-white shadow-sm rounded-xl mx-auto w-full max-w-4xl -mt-8 z-10 relative flex flex-col sm:flex-row gap-4 p-4 items-center justify-between" role="search" aria-label="Filter prices">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <label className="flex flex-col gap-1 w-full sm:w-48">
            <span className="sr-only">Filter by state</span>
            <select
              className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52B788]"
              value={state}
              onChange={e => setState(e.target.value)}
              aria-label="Filter by state"
            >
              <option value="">All States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 w-full sm:w-48">
            <span className="sr-only">Filter by commodity</span>
            <select
              className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52B788]"
              value={commodity}
              onChange={e => setCommodity(e.target.value)}
              aria-label="Filter by commodity"
            >
              <option value="">All Commodities</option>
              {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        {/* Price Alert Toggle for logged-in users */}
        <div className="w-full mt-2">
          <PriceAlertToggle commodity={commodity} state={state} enabled={false} threshold={10} />
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {isPending ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading prices"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <span className="sr-only">Loading market prices, please wait…</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} aria-hidden="true" className="bg-white rounded-xl shadow p-4 animate-pulse h-48" />
            ))}
          </div>
        ) : prices && prices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Price listings" aria-live="polite">
            {(prices as unknown as (PriceCardProps & { id?: string | number })[]).map((price) => (
              <PriceCard key={price.id ?? (price as { commodity_name?: string }).commodity_name + price.state} {...price} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-16">No market prices found for your selection.</p>
        )}
      </div>
      </main>

      {/* USSD Fallback Banner */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2D6A4F] text-white text-center py-3 px-4 z-50 shadow-lg" role="complementary" aria-label="Offline access">
        <span className="font-semibold">No internet?</span> Dial <span className="font-bold">*384*PRICE#</span> to get today&apos;s prices by SMS
      </div>
    </div>
  );
}
