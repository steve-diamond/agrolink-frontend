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

const PRODUCE_OPTIONS = [
  "Maize","Cassava","Rice","Yam","Tomatoes","Peppers","Sorghum","Groundnut",
  "Beans","Millet","Soybean","Fruits","Vegetables","Livestock","Fish","Other",
] as const;

export default function CooperativeRegisterPage() {
  const [orgName, setOrgName]         = useState("");
  const [cacNumber, setCacNumber]     = useState("");
  const [state, setState]             = useState("");
  const [lga, setLga]                 = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [produce, setProduce]         = useState<string[]>([]);
  const [fieldError, setFieldError]   = useState("");

  function toggleProduce(item: string) {
    setProduce((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  }

  function buildPayload(base: RegisterPayload): RegisterPayload | null {
    if (!orgName.trim()) {
      setFieldError("Organization name is required.");
      return null;
    }
    if (!state) {
      setFieldError("Please select your state.");
      return null;
    }
    setFieldError("");
    return {
      ...base,
      organizationName: orgName.trim(),
      metadata: {
        cacNumber: cacNumber.trim(),
        state,
        lga: lga.trim(),
        memberCount: memberCount.trim(),
        primaryProduce: produce,
      },
    };
  }

  return (
    <RegisterFormShell
      role="cooperative"
      eyebrow="Cooperative Registration"
      title="Register your Cooperative"
      subtitle="Connect your cooperative to markets, credit, and verified buyers across Nigeria."
      bullets={[
        "Aggregate produce from all members",
        "Access group-level credit scoring",
        "Manage bulk transactions centrally",
        "Receive payments into cooperative account",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Cooperative farmers working together" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Cooperative market overview" }}
      buildPayload={buildPayload}
    >
      {/* ── Organization Name ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="e.g. Kano Groundnut Farmers Cooperative"
        />
      </div>

      {/* ── CAC Number ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          CAC Registration Number
          <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>
        </label>
        <input
          type="text"
          value={cacNumber}
          onChange={(e) => setCacNumber(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="RC123456"
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

      {/* ── Member Count ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Number of Members
        </label>
        <select
          aria-label="Number of Members"
          value={memberCount}
          onChange={(e) => setMemberCount(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select range</option>
          <option value="1-10">1 – 10</option>
          <option value="11-50">11 – 50</option>
          <option value="51-200">51 – 200</option>
          <option value="201-500">201 – 500</option>
          <option value="500+">500+</option>
        </select>
      </div>

      {/* ── Primary Produce ── */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Primary Produce (select all that apply)</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCE_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleProduce(item)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                produce.includes(item)
                  ? "border-amber-500 bg-amber-100 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {fieldError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fieldError}</p>
      )}
    </RegisterFormShell>
  );
}
