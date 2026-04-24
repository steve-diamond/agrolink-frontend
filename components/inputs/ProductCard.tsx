import React from 'react';
import Image from 'next/image';

export interface ProductCardProps {
  name: string;
  brand?: string;
  price_per_unit: number;
  unit: string;
  image_url?: string;
  seller_name: string;
  state: string;
  is_nafdac_approved?: boolean;
  onAddToCart?: () => void;
}

export default function ProductCard({
  name,
  brand,
  price_per_unit,
  unit,
  image_url,
  seller_name,
  state,
  is_nafdac_approved,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
      <div className="aspect-w-4 aspect-h-3 mb-2">
        <Image
          src={image_url || '/placeholder.png'}
          alt={name}
          fill
          className="object-cover rounded-xl w-full h-full"
          sizes="100vw"
          priority
        />
      </div>
      <div className="font-bold text-lg mb-1">{name}</div>
      {brand && <div className="text-gray-500 text-sm mb-1">{brand}</div>}
      <div className="text-[#2D6A4F] font-semibold text-xl mb-1">₦{price_per_unit.toLocaleString()} <span className="text-base font-normal">/{unit}</span></div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-600 text-sm">{seller_name}</span>
        <span className="bg-[#52B788] text-white text-xs px-2 py-0.5 rounded">Verified</span>
      </div>
      <div className="text-gray-400 text-xs mb-2">{state}</div>
      {is_nafdac_approved && <div className="text-xs text-green-700 font-semibold mb-2">NAFDAC Approved</div>}
      <button
        className="btn bg-[#2D6A4F] text-white mt-auto"
        onClick={onAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
