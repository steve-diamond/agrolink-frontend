"use client";
import React, { useState } from 'react';

interface InsuranceForm {
  [key: string]: string;
}
import { useRouter } from 'next/navigation';

const CROPS = ['Maize', 'Cassava', 'Rice', 'Poultry', 'Fishery', 'Vegetables', 'Mixed'];
const STATES = ['Lagos', 'Kano', 'Kaduna', 'Ogun', 'Oyo', 'Benue', 'Abia', 'FCT'];
export default function InsuranceApplyPage() {
  const [form, setForm] = useState<InsuranceForm>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/insurance/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Application failed');
      router.push('/insurance/apply?success=1');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Application failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-2xl shadow-md mt-8 mb-16">
      <h1 className="text-2xl font-bold mb-4 text-[#2D6A4F]">Apply for Crop Insurance</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input name="full_name" required className="input" onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">BVN</label>
          <input name="bvn" required maxLength={11} minLength={11} className="input" type="password" onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input name="phone" required className="input" onChange={handleChange} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">State</label>
            <select name="state" required className="input" onChange={handleChange}>
              <option value="">Select State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">LGA</label>
            <input name="lga" required className="input" onChange={handleChange} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Farm Size (ha)</label>
            <input name="farm_size_ha" type="number" min="0.1" step="0.1" required className="input" onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Crop Type</label>
            <select name="crop_type" required className="input" onChange={handleChange}>
              <option value="">Select</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Planting Date</label>
            <input name="planting_date" type="date" required className="input" onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Expected Harvest Date</label>
            <input name="harvest_date" type="date" required className="input" onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Plan</label>
          <select name="plan" required className="input" onChange={handleChange}>
            <option value="">Select Plan</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Bank Name</label>
            <input name="bank_name" required className="input" onChange={handleChange} />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Account Number</label>
            <input name="account_number" required className="input" onChange={handleChange} />
          </div>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <button type="submit" className="btn bg-[#2D6A4F] text-white w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
      </form>
    </div>
  );
}
