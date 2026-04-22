import React from 'react';

const commodityEmojis: Record<string, string> = {
  Maize: '🌽',
  Cassava: '🥔',
  Yam: '🍠',
  Plantain: '🍌',
  Tomato: '🍅',
  Pepper: '🌶️',
  'Rice (local)': '🍚',
  'Soya Beans': '🫘',
  'Palm Oil': '🛢️',
  Catfish: '🐟',
  'Broiler Chicken': '🍗',
  'Ugu (Pumpkin Leaf)': '🥬',
};

const trendIcons = {
  up: { icon: '↑', color: 'text-green-600' },
  down: { icon: '↓', color: 'text-red-600' },
  stable: { icon: '→', color: 'text-gray-400' },
};

export interface PriceCardProps {
  commodity_name: string;
  price_per_kg: number;
  unit?: string;
  state: string;
  trend: 'up' | 'down' | 'stable';
  price_change_pct?: number;
  updated_at: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  commodity_name,
  price_per_kg,
  unit = 'kg',
  state,
  trend,
  price_change_pct,
  updated_at,
}) => {
  const emoji = commodityEmojis[commodity_name] || '🧺';
  const trendObj = trendIcons[trend];
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="font-bold text-lg mb-1">{commodity_name}</div>
      <div className="text-2xl font-semibold text-[#2D6A4F] mb-1">
        ₦{price_per_kg.toLocaleString()} <span className="text-base font-normal">/{unit}</span>
      </div>
      <div className="text-gray-500 text-sm mb-1">{state}</div>
      <div className="flex items-center gap-1 mb-1">
        <span className={trendObj.color + ' text-xl'}>{trendObj.icon}</span>
        {typeof price_change_pct === 'number' && (
          <span className={
            price_change_pct > 0
              ? 'text-green-600'
              : price_change_pct < 0
              ? 'text-red-600'
              : 'text-gray-400'
          }>
            {price_change_pct > 0 ? '+' : ''}{price_change_pct}%
          </span>
        )}
      </div>
      <div className="text-xs text-gray-400">Last updated: {new Date(updated_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</div>
    </div>
  );
};

export default PriceCard;
