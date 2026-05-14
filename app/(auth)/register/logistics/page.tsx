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

const VEHICLE_TYPES = ["Motorcycle", "Tricycle (Keke)", "Van", "Pickup Truck", "Medium Truck (7 tons)", "Heavy Truck (10+ tons)", "Refrigerated Truck"] as const;

export default function LogisticsRegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [vehicleType, setVehicleType]   = useState("");
  const [fleetSize, setFleetSize]       = useState("");
  const [opStates, setOpStates]         = useState<string[]>([]);
  const [ninOrLicense, setNinOrLicense] = useState("");
  const [years, setYears]               = useState("");
  const [fieldError, setFieldError]     = useState("");

  function toggleState(s: string) {
    setOpStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function buildPayload(base: RegisterPayload): RegisterPayload | null {
    if (!vehicleType) {
      setFieldError("Please select your primary vehicle type.");
      return null;
    }
    setFieldError("");
    return {
      ...base,
      organizationName: businessName.trim() || undefined,
      metadata: {
        vehicleType,
        fleetSize,
        operationalStates: opStates,
        ninOrLicense: ninOrLicense.trim(),
        yearsInOperation: years,
      },
    };
  }

  return (
    <RegisterFormShell
      role="logistics"
      eyebrow="Logistics Partner Registration"
      title="Register as a Logistics Partner"
      subtitle="Move agricultural produce across Nigeria and earn per completed delivery."
      bullets={[
        "Receive dispatch requests in your area",
        "Update transit status in real time",
        "Get paid directly to your bank or wallet",
        "Build a verified track record on the platform",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Logistics truck on a Nigerian road" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Produce loading operations" }}
      buildPayload={buildPayload}
    >
      {/* ── Business / Trading Name ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Business / Trading Name
          <span className="ml-1 text-xs font-normal text-slate-500">(optional — leave blank if individual)</span>
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="e.g. Fast Agro Haulage"
        />
      </div>

      {/* ── Vehicle Type & Fleet Size ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Primary Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            aria-label="Primary Vehicle Type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Select type</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Fleet Size</label>
          <select
            aria-label="Fleet Size"
            value={fleetSize}
            onChange={(e) => setFleetSize(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          >
            <option value="">Select</option>
            <option value="1">1 vehicle</option>
            <option value="2-5">2 – 5</option>
            <option value="6-20">6 – 20</option>
            <option value="20+">20+</option>
          </select>
        </div>
      </div>

      {/* ── Years in Operation ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Years in Operation</label>
        <select
          aria-label="Years in Operation"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select</option>
          <option value="<1">Less than 1 year</option>
          <option value="1-3">1 – 3 years</option>
          <option value="3-7">3 – 7 years</option>
          <option value="7+">7+ years</option>
        </select>
      </div>

      {/* ── NIN / Driver's License ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          NIN or Driver&apos;s License Number
          <span className="ml-1 text-xs font-normal text-slate-500">(for KYC verification)</span>
        </label>
        <input
          type="text"
          value={ninOrLicense}
          onChange={(e) => setNinOrLicense(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="NIN or driver's license number"
        />
      </div>

      {/* ── Operational States ── */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Operational States <span className="font-normal text-slate-500">(select all that apply)</span>
        </p>
        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-green-100 bg-green-50 p-3">
          {NIGERIAN_STATES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleState(s)}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                opStates.includes(s)
                  ? "border-orange-500 bg-orange-100 text-orange-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {opStates.length > 0 && (
          <p className="mt-1 text-xs text-slate-500">{opStates.length} state(s) selected</p>
        )}
      </div>

      {fieldError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fieldError}</p>
      )}
    </RegisterFormShell>
  );
}
