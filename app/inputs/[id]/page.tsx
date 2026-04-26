"use client";
import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
// import ProductCard from 'components/inputs/ProductCard'; // Removed unused import
import { useCartStore } from 'store/cart';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, isLoading } = useSWR(`/api/inputs/products/${id}`, (url) => fetch(url).then((r) => r.json()));
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!data?.product) return <div className="p-8">Product not found.</div>;
  const product = data.product;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Image src={product.image_url || '/placeholder.png'} alt={product.name} width={320} height={320} className="rounded-2xl w-full h-80 object-cover" />
        </div>
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.brand && <div className="text-gray-500 mb-2">{product.brand}</div>}
          <div className="text-[#2D6A4F] font-semibold text-2xl mb-2">₦{product.price_per_unit.toLocaleString()} <span className="text-base font-normal">/{product.unit}</span></div>
          <div className="mb-2 text-gray-600">Seller: {product.seller_name}</div>
          <div className="mb-2 text-gray-400">Location: {product.state}</div>
          {product.is_nafdac_approved && <div className="text-xs text-green-700 font-semibold mb-2">NAFDAC Approved</div>}
          <div className="mb-4">{product.description}</div>
          <button
            className="btn bg-[#2D6A4F] text-white w-full mt-auto"
            onClick={() => {
              addItem({ ...product, quantity: 1 });
              router.push('/inputs/checkout');
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
