import React from 'react';
import Image from 'next/image';
// import useSWR from 'swr';
import Link from 'next/link';

export default function SellerDashboard() {
  // TODO: Restore SWR data fetching when build is unblocked
  // const seller_id = 'demo-seller-id';
  // const { data, isLoading } = useSWR(`/api/inputs/products?seller_id=${seller_id}`, (url) => fetch(url).then(r => r.json()));
  const data = { products: [] };
  const isLoading = false;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#2D6A4F]">My Input Listings</h1>
      <div className="mb-6">
        <Link href="/dashboard/seller/upload" className="btn bg-[#2D6A4F] text-white">+ Add New Product</Link>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : data?.products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.products.map((product: {
            id: string | number;
            image_url?: string;
            name: string;
            brand?: string;
            price_per_unit?: number;
            unit?: string;
            state?: string;
          }) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <Image src={product.image_url || '/placeholder.png'} alt={product.name} width={160} height={160} className="rounded-xl h-40 object-cover mb-2" />
              <div className="font-bold">{product.name}</div>
              <div className="text-gray-500 text-sm">{product.brand}</div>
              <div className="text-[#2D6A4F] font-semibold">₦{product.price_per_unit?.toLocaleString()} / {product.unit}</div>
              <div className="text-xs text-gray-400">{product.state}</div>
              <div className="mt-2 flex gap-2">
                <Link href={`/inputs/${product.id}`} className="btn btn-sm bg-[#40916C] text-white">View</Link>
                {/* TODO: Add edit/delete actions */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No products listed yet.</div>
      )}
    </div>
  );
}
