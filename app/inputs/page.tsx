"use client";
"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import ProductCard from 'components/inputs/ProductCard';
import { useCartStore } from 'store/cart';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Seeds', value: 'seeds' },
  { label: 'Fertiliser', value: 'fertiliser' },
  { label: 'Agrochemicals', value: 'agrochemical' },
  { label: 'Equipment', value: 'equipment' },
];

export default function InputsMarketplacePage() {
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [price, setPrice] = useState([0, 500000]);
  const [nafdac, setNafdac] = useState(false);
  const { data, isLoading } = useSWR(
    `/api/inputs/products?${category ? `category=${category}&` : ''}${state ? `state=${state}&` : ''}minPrice=${price[0]}&maxPrice=${price[1]}${nafdac ? '&nafdac=1' : ''}`,
    (url) => fetch(url).then((r) => r.json())
  );
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-64 bg-white p-6 border-r">
        <div className="font-bold mb-4">Filter</div>
        <div className="mb-4">
          <div className="font-medium mb-2">Category</div>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`btn ${category === cat.value ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100'}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="font-medium mb-2">State</div>
          <input className="input" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Kano" />
        </div>
        <div className="mb-4">
          <div className="font-medium mb-2">Price Range (₦)</div>
          <label htmlFor="minPrice" className="sr-only">Minimum Price</label>
          <input id="minPrice" type="range" min={0} max={500000} value={price[0]} onChange={e => setPrice([Number(e.target.value), price[1]])} title="Minimum Price" />
          <label htmlFor="maxPrice" className="sr-only">Maximum Price</label>
          <input id="maxPrice" type="range" min={0} max={500000} value={price[1]} onChange={e => setPrice([price[0], Number(e.target.value)])} title="Maximum Price" />
          <div className="text-xs">₦{price[0].toLocaleString()} - ₦{price[1].toLocaleString()}</div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input id="nafdac" type="checkbox" checked={nafdac} onChange={e => setNafdac(e.target.checked)} title="NAFDAC Approved Only" />
          <label htmlFor="nafdac">NAFDAC Approved Only</label>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-2 text-[#2D6A4F]">Certified Farm Inputs</h1>
        <p className="mb-6 text-gray-600">Buy directly from verified agro-dealers</p>
        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-4 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.products?.map((product: any) => (
              <ProductCard key={product.id} {...product} onAddToCart={() => addItem({ ...product, quantity: 1 })} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
