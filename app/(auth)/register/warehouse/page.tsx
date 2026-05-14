"use client";

import { useState } from "react";
import RegisterFormShell, { type RegisterPayload } from "../_components/RegisterFormShell";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Federal Capital Territory",
  "Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
] as const;

const STORAGE_TYPES = ["Dry Goods / Bagged Produce", "Cold Storage / Refrigerated", "Grain Silos", "Multi-purpose", "Open Yard / Covered Shed"] as const;

export default function WarehouseRegisterPage() {
  const [facilityName, setFacilityName]   = useState("");
  const [address, setAddress]             = useState("");
  const [state, setState]                 = useState("");
  const [lga, setLga]                     = useState("");
  const [storageType, setStorageType]     = useState("");
  const [capacityTons, setCapacityTons]   = useState("");
  const [yearsOp, setYearsOp]             = useState("");
  const [fieldError, setFieldError]       = useState("");

  function buildPayload(base: RegisterPayload): RegisterPayload | null {
    if (!facilityName.trim()) {
      setFieldError("Facility name is required.");
      return null;
    }
    if (!state) {
      setFieldError("Please select your state.");
      return null;
    }
    if (!storageType) {
      setFieldError("Please select a storage type.");
      return null;
    }
    setFieldError("");
    return {
      ...base,
      organizationName: facilityName.trim(),
      metadata: {
        facilityAddress: address.trim(),
        state,
        lga: lga.trim(),
        storageType,
        capacityTons: capacityTons.trim(),
        yearsInOperation: yearsOp,
      },
    };
  }

  return (
    <RegisterFormShell
      role="warehouse"
      eyebrow="Warehouse Manager Registration"
      title="Register your Storage Facility"
      subtitle="List your warehouse on AgroLink and connect directly with farmers needing reliable storage."
      bullets={[
        "Manage storage capacity in real time",
        "Confirm farmer bookings digitally",
        "Release inventory on verified demand",
        "Build reputation through transparent reviews",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Modern warehouse storing agricultural produce" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Warehouse inventory management" }}
      buildPayload={buildPayload}
    >
      {/* ── Facility Name ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Facility / Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="e.g. Ogun Cold Chain Warehouse"
        />
      </div>

      {/* ── Address ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Facility Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="Street address"
        />
      </div>

      {/* ── State & LGA ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            State <span className="text-red-500">*</span>
          </label>
          <select
            aria-label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">LGA</label>
          <input
            type="text"
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="Local Govt Area"
          />
        </div>
      </div>

      {/* ── Storage Type ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Storage Type <span className="text-red-500">*</span>
        </label>
        <select
          aria-label="Storage Type"
          value={storageType}
          onChange={(e) => setStorageType(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select type</option>
          {STORAGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* ── Capacity & Years ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Capacity (metric tons)</label>
          <input
            type="number"
            min="1"
            value={capacityTons}
            onChange={(e) => setCapacityTons(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Years Operating</label>
          <select
            aria-label="Years Operating"
            value={yearsOp}
            onChange={(e) => setYearsOp(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Select</option>
            <option value="<1">Less than 1 year</option>
            <option value="1-3">1 – 3 years</option>
            <option value="3-7">3 – 7 years</option>
            <option value="7+">7+ years</option>
          </select>
        </div>
      </div>

      {fieldError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fieldError}</p>
      )}
    </RegisterFormShell>
  );
}
