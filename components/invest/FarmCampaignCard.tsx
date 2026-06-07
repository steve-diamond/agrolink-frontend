
import React from "react";
import Image from "next/image";

interface FarmCampaignCardProps {
  campaign?: {
    id: string;
    cover_image_url: string;
    crop_type: string;
    farmer_name: string;
    state: string;
    raised_amount: number;
    target_amount: number;
    expected_return_pct: number;
    duration_months: number;
    min_investment: number;
    investor_count: number;
    status: string;
  };
}

const FarmCampaignCard: React.FC<FarmCampaignCardProps> = ({ campaign }) => {
  if (!campaign) {
    return null;
  }

  const data = campaign;
  const percent = Math.min(100, Math.round((data.raised_amount / data.target_amount) * 100));

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <div className="relative h-44 w-full bg-gray-100">
        {data.cover_image_url ? (
          <Image
            src={data.cover_image_url}
            alt={data.crop_type}
            fill
            className="object-cover w-full h-full"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
        <span className="absolute top-2 left-2 bg-green-700 text-white text-xs px-3 py-1 rounded-full">{data.crop_type}</span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">{data.crop_type}</span>
          <span className="text-xs text-gray-500 ml-auto">{data.farmer_name} · {data.state}</span>
        </div>
        <div className="mb-2">
          <progress className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-green-600 [&::-moz-progress-bar]:bg-green-600" value={percent} max={100} aria-label="Campaign funding progress" />
          <div className="flex justify-between text-xs mt-1">
            <span>₦{data.raised_amount.toLocaleString()} / ₦{data.target_amount.toLocaleString()}</span>
            <span>{percent}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{data.expected_return_pct}% p.a.</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{data.duration_months} mo</span>
          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">Min ₦{data.min_investment.toLocaleString()}</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{data.investor_count} investors</span>
        </div>
        <button className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition">Invest Now</button>
      </div>
    </div>
  );
};

export default FarmCampaignCard;
