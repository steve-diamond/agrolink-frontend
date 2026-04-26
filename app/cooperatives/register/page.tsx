"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
const COMMODITIES = [
  'Maize', 'Cassava', 'Rice', 'Poultry', 'Fishery', 'Vegetables', 'Mixed'
];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}


type CooperativeForm = {
  name?: string;
  cac_reg_number?: string;
  state?: string;
  lga?: string;
  year_founded?: string;
  primary_commodity?: string;
  member_count?: string;
  chairman_name?: string;
  chairman_phone?: string;
  chairman_email?: string;
  secretary_name?: string;
  secretary_phone?: string;
  secretary_email?: string;
};

export default function CooperativeRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CooperativeForm>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
      if (photo) fd.append('photo', photo);
      const res = await fetch('/api/cooperatives/register', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      router.push('/cooperatives/register?success=1');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        // @ts-expect-error: err.message may exist on unknown error objects
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-2xl shadow-md mt-8 mb-16">
      <h1 className="text-2xl font-bold mb-2 text-[#2D6A4F]">Register a Cooperative</h1>
      <ProgressBar step={step} />
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Cooperative Name</label>
              <input name="name" required className="input" onChange={handleChange} placeholder="Enter cooperative name" />
            </div>
            <div>
              <label className="block font-medium mb-1">CAC Registration Number</label>
              <input name="cac_reg_number" required className="input" onChange={handleChange} placeholder="CAC registration number" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">State</label>
                <select name="state" required className="input" onChange={handleChange} title="Select state">
                  <option value="">Select State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">LGA</label>
                <input name="lga" required className="input" onChange={handleChange} placeholder="Enter LGA" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Year Founded</label>
                <input name="year_founded" type="number" min="1900" max="2026" required className="input" onChange={handleChange} placeholder="Year founded" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Primary Commodity</label>
                <select name="primary_commodity" required className="input" onChange={handleChange} title="Select primary commodity">
                  <option value="">Select</option>
                  {COMMODITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Estimated Member Count</label>
              <input name="member_count" type="number" min="1" required className="input" onChange={handleChange} placeholder="Estimated member count" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="font-semibold text-[#2D6A4F]">Leadership Contact</div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Chairman Name</label>
                <input name="chairman_name" required className="input" onChange={handleChange} placeholder="Chairman name" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Chairman Phone</label>
                <input name="chairman_phone" required pattern="0[789][01]\d{8}" className="input" onChange={handleChange} placeholder="080XXXXXXXX" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Chairman Email</label>
                <input name="chairman_email" type="email" required className="input" onChange={handleChange} placeholder="Chairman email" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Secretary Name</label>
                <input name="secretary_name" required className="input" onChange={handleChange} placeholder="Secretary name" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Secretary Phone</label>
                <input name="secretary_phone" required pattern="0[789][01]\d{8}" className="input" onChange={handleChange} placeholder="080XXXXXXXX" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Secretary Email</label>
                <input name="secretary_email" type="email" required className="input" onChange={handleChange} placeholder="Secretary email" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Upload Group Photo (max 2MB)</label>
              <input name="photo" type="file" accept="image/*" className="input" onChange={handlePhoto} title="Upload group photo (max 2MB)" />
              {photoPreview && (
                <Image src={photoPreview || '/placeholder.png'} alt="Preview" width={96} height={96} className="mt-2 w-24 h-24 object-cover rounded-lg border" />
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="font-semibold text-[#2D6A4F] mb-2">Review & Submit</div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              <div className="font-bold mb-1">{form.name}</div>
              <div className="text-sm mb-1">CAC: {form.cac_reg_number}</div>
              <div className="text-sm mb-1">{form.state}, {form.lga}</div>
              <div className="text-sm mb-1">Founded: {form.year_founded}</div>
              <div className="text-sm mb-1">Commodity: {form.primary_commodity}</div>
              <div className="text-sm mb-1">Members: {form.member_count}</div>
              <div className="text-sm mb-1">Chairman: {form.chairman_name} ({form.chairman_phone}, {form.chairman_email})</div>
              <div className="text-sm mb-1">Secretary: {form.secretary_name} ({form.secretary_phone}, {form.secretary_email})</div>
              {photoPreview && <Image src={photoPreview} alt="Preview" width={96} height={96} className="mt-2 w-24 h-24 object-cover rounded-lg border" />}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" required id="confirm" className="mr-2" />
              <label htmlFor="confirm" className="text-sm">I confirm this cooperative is CAC registered</label>
            </div>
          </div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="flex gap-2 mt-6">
          {step > 1 && (
            <button type="button" className="btn" onClick={() => setStep(step - 1)} disabled={submitting}>Back</button>
          )}
          {step < 3 && (
            <button type="button" className="btn bg-[#2D6A4F] text-white" onClick={() => setStep(step + 1)} disabled={submitting}>Next</button>
          )}
          {step === 3 && (
            <button type="submit" className="btn bg-[#2D6A4F] text-white" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          )}
        </div>
      </form>
    </div>
  );
}
