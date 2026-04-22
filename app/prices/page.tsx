"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import PriceCard from 'components/prices/PriceCard';
import dynamic from 'next/dynamic';

const PriceAlertToggle = dynamic(() => import('./PriceAlertToggle'), { ssr: false });

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
const COMMODITIES = [
  'Maize', 'Cassava', 'Yam', 'Plantain', 'Tomato', 'Pepper', 'Rice (local)', 'Soya Beans', 'Palm Oil', 'Catfish', 'Broiler Chicken', 'Ugu (Pumpkin Leaf)'
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LiveMarketPricesPage() {
  const [state, setState] = useState('');
  const [commodity, setCommodity] = useState('');
  const { data, isLoading } = useSWR(
    `/api/prices?${state ? `state=${encodeURIComponent(state)}&` : ''}${commodity ? `commodity=${encodeURIComponent(commodity)}` : ''}`,
    fetcher
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      {/* Hero Banner */}
      <div className="bg-[#2D6A4F] text-white py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Live Market Intelligence</h1>
        <p className="text-lg opacity-90">Updated every 6 hours from verified aggregators</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-sm rounded-xl mx-auto w-full max-w-4xl -mt-8 z-10 relative flex flex-col sm:flex-row gap-4 p-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <select
            className="border border-gray-200 rounded px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            value={state}
            onChange={e => setState(e.target.value)}
          >
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            value={commodity}
            onChange={e => setCommodity(e.target.value)}
          >
            <option value="">All Commodities</option>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Price Alert Toggle for logged-in users */}
        <div className="w-full mt-2">
          <PriceAlertToggle commodity={commodity} state={state} enabled={false} threshold={10} />
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse h-48" />
            ))}
          </div>
        ) : data?.prices?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.prices.map((price: any) => (
              <PriceCard key={price.id} {...price} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16">No market prices found for your selection.</div>
        )}
      </div>

      {/* USSD Fallback Banner */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2D6A4F] text-white text-center py-3 px-4 z-50 shadow-lg">
        <span className="font-semibold">No internet?</span> Dial <span className="font-bold">*384*PRICE#</span> to get today&apos;s prices by SMS
      </div>
    </div>
  );
}
