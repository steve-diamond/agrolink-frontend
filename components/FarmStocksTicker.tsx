"use client";

import { useEffect, useState } from "react";

interface CommodityPrice {
  commodity_name: string;
  state: string;
  price: number;
  unit?: string;
}

const FALLBACK_PRICES: CommodityPrice[] = [
  { commodity_name: "Maize", state: "Kano", price: 45000, unit: "bag" },
  { commodity_name: "Rice", state: "Kebbi", price: 85000, unit: "bag" },
  { commodity_name: "Soybean", state: "Kaduna", price: 120000, unit: "bag" },
  { commodity_name: "Cassava", state: "Oyo", price: 18000, unit: "bag" },
  { commodity_name: "Yam", state: "Benue", price: 35000, unit: "tuber" },
  { commodity_name: "Tomato", state: "Katsina", price: 12000, unit: "crate" },
  { commodity_name: "Groundnut", state: "Kano", price: 95000, unit: "bag" },
  { commodity_name: "Sorghum", state: "Plateau", price: 55000, unit: "bag" },
  { commodity_name: "Millet", state: "Sokoto", price: 48000, unit: "bag" },
  { commodity_name: "Palm Oil", state: "Cross River", price: 180000, unit: "drum" },
  { commodity_name: "Cocoa", state: "Ondo", price: 320000, unit: "bag" },
  { commodity_name: "Cotton", state: "Zamfara", price: 72000, unit: "bag" },
];

function formatPrice(price: number): string {
  if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`;
  return `₦${price.toLocaleString()}`;
}

export default function FarmStocksTicker() {
  const [prices, setPrices] = useState<CommodityPrice[]>(FALLBACK_PRICES);

  useEffect(() => {
    fetch("/api/prices")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.prices?.length) {
          setPrices(data.prices.slice(0, 20));
        }
      })
      .catch(() => {
        // Keep fallback data on error
      });
  }, []);

  // Duplicate the list so the scroll loops seamlessly
  const items = [...prices, ...prices];

  return (
    <div className="w-full bg-green-900 text-white overflow-hidden border-y border-green-700 py-2 select-none">
      <div className="flex items-center gap-0">
        {/* Label */}
        <div className="shrink-0 bg-green-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 mr-3 rounded-r-full z-10">
          📊 Farm Stocks
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-8 animate-ticker whitespace-nowrap">
            {items.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-sm shrink-0">
                <span className="font-semibold text-green-200">{item.commodity_name}</span>
                <span className="text-white/60 text-xs">({item.state})</span>
                <span className="text-yellow-300 font-bold">
                  {formatPrice(item.price)}
                  {item.unit ? `/${item.unit}` : ""}
                </span>
                <span className="text-green-600 mx-2">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
