"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'seeds',
  'fertiliser',
  'agrochemical',
  'equipment',
  'other',
];

export default function ProductUploadPage() {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price_per_unit: '',
    unit: '',
    quantity_available: '',
    state: '',
    delivery_available: false,
    image_url: '',
    is_nafdac_approved: false,
    nafdac_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Replace with actual seller_id from auth
    const seller_id = 'demo-seller-id';
    const res = await fetch('/api/inputs/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, seller_id, price_per_unit: Number(form.price_per_unit), quantity_available: Number(form.quantity_available) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Failed to upload product');
    } else {
      router.push('/dashboard/seller');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#2D6A4F]">Add New Input Product</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} required className="input w-full" placeholder="Product Name" />
        <input name="brand" value={form.brand} onChange={handleChange} className="input w-full" placeholder="Brand (optional)" />
        <select name="category" value={form.category} onChange={handleChange} required className="input w-full">
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} className="input w-full" placeholder="Description" />
        <input name="price_per_unit" value={form.price_per_unit} onChange={handleChange} required className="input w-full" placeholder="Price per unit (₦)" type="number" min="0" />
        <input name="unit" value={form.unit} onChange={handleChange} required className="input w-full" placeholder="Unit (e.g. bag, litre)" />
        <input name="quantity_available" value={form.quantity_available} onChange={handleChange} required className="input w-full" placeholder="Quantity Available" type="number" min="1" />
        <input name="state" value={form.state} onChange={handleChange} required className="input w-full" placeholder="State (e.g. Kano)" />
        <label className="flex items-center gap-2">
          <input name="delivery_available" type="checkbox" checked={form.delivery_available} onChange={handleChange} /> Delivery Available
        </label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="input w-full" placeholder="Image URL (optional)" />
        <label className="flex items-center gap-2">
          <input name="is_nafdac_approved" type="checkbox" checked={form.is_nafdac_approved} onChange={handleChange} /> NAFDAC Approved
        </label>
        {form.is_nafdac_approved && (
          <input name="nafdac_number" value={form.nafdac_number} onChange={handleChange} className="input w-full" placeholder="NAFDAC Number" />
        )}
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="btn bg-[#2D6A4F] text-white w-full" disabled={loading}>{loading ? 'Uploading...' : 'Upload Product'}</button>
      </form>
    </div>
  );
}
