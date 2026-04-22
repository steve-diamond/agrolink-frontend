"use client";
import React, { useState, useMemo } from 'react';
import { base_rate_per_hectare, state_risk_factors, crop_risk_factors, plans } from 'lib/insurance-factors';

const STATES = Object.keys(state_risk_factors);
const CROPS = Object.keys(crop_risk_factors);

export default function QuoteCalculator() {
  const [crop, setCrop] = useState(CROPS[0]);
  const [farmSize, setFarmSize] = useState(1);
  const [state, setState] = useState(STATES[0]);
  const [season, setSeason] = useState('2026');

  const { premium, coverage, plan } = useMemo(() => {
    const cropFactor = crop_risk_factors[crop] || 1;
    const stateFactor = state_risk_factors[state] || 1;
    const estPremium = Math.round(base_rate_per_hectare * farmSize * stateFactor * cropFactor);
    let plan = plans[0];
    if (estPremium >= plans[2].price) plan = plans[2];
    else if (estPremium >= plans[1].price) plan = plans[1];
    else plan = plans[0];
    return {
      premium: estPremium,
      coverage: plan.coverage,
      plan: plan.name,
    };
  }, [crop, farmSize, state]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-[#2D6A4F]">Get an Instant Quote</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">Crop Type</label>
          <select className="input" value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Farm Size (hectares)</label>
          <input type="number" min={1} className="input" value={farmSize} onChange={e => setFarmSize(Number(e.target.value))} />
        </div>
        <div>
          <label className="block font-medium mb-1">State</label>
          <select className="input" value={state} onChange={e => setState(e.target.value)}>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Season</label>
          <input type="text" className="input" value={season} onChange={e => setSeason(e.target.value)} />
        </div>
      </div>
      <div className="bg-[#F8FAF9] rounded-xl p-4 mt-2">
        <div className="font-semibold text-[#2D6A4F] mb-1">Estimated Premium: <span className="text-lg">₦{premium.toLocaleString()}</span></div>
        <div className="mb-1">Coverage Amount: <span className="font-semibold">₦{coverage.toLocaleString()}</span></div>
        <div className="mb-1">Recommended Plan: <span className="font-semibold">{plan}</span></div>
      </div>
    </div>
  );
}
