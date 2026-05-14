"use client";

import { useState } from "react";
import RegisterFormShell, { type RegisterPayload } from "../_components/RegisterFormShell";

const INTEREST_AREAS = [
  "Grains & Cereals",
  "Root Crops (Cassava / Yam)",
  "Horticulture",
  "Agro-processing",
  "Cold Chain / Logistics",
  "Fertiliser & Inputs",
  "Irrigation",
  "Equipment Leasing",
  "Agricultural Finance",
] as const;

export default function InvestorRegisterPage() {
  const [investorType, setInvestorType]   = useState<"individual" | "corporate" | "">("");
  const [companyName, setCompanyName]     = useState("");
  const [investRange, setInvestRange]     = useState("");
  const [interests, setInterests]         = useState<string[]>([]);
  const [linkedin, setLinkedin]           = useState("");
  const [fieldError, setFieldError]       = useState("");

  function toggleInterest(item: string) {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function buildPayload(base: RegisterPayload): RegisterPayload | null {
    if (!investorType) {
      setFieldError("Please select investor type.");
      return null;
    }
    if (investorType === "corporate" && !companyName.trim()) {
      setFieldError("Company name is required for corporate investors.");
      return null;
    }
    setFieldError("");
    return {
      ...base,
      organizationName: investorType === "corporate" ? companyName.trim() : undefined,
      metadata: {
        investorType,
        investmentRange: investRange,
        areasOfInterest: interests,
        linkedinOrWebsite: linkedin.trim(),
      },
    };
  }

  return (
    <RegisterFormShell
      role="investor"
      eyebrow="Investor Registration"
      title="Register as an Investor"
      subtitle="Back Nigerian agriculture with transparent, impact-driven returns."
      bullets={[
        "Browse vetted investment opportunities",
        "Monitor real-time portfolio returns",
        "Support smallholder farmers at scale",
        "Dual returns: financial & social impact",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Agricultural investment landscape" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Nigerian agri-finance growth" }}
      buildPayload={buildPayload}
      successRedirect="/investor?registered=1"
    >
      {/* ── Investor Type ── */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Investor Type <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["individual", "corporate"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInvestorType(t)}
              className={`rounded-xl border py-2.5 text-sm font-semibold capitalize transition-colors ${
                investorType === t
                  ? "border-violet-500 bg-violet-50 text-violet-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Company Name (corporate only) ── */}
      {investorType === "corporate" && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="Registered company name"
          />
        </div>
      )}

      {/* ── Investment Range ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Intended Investment Range
        </label>
        <select
          aria-label="Investment Range"
          value={investRange}
          onChange={(e) => setInvestRange(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select range</option>
          <option value="<1M">Under ₦1,000,000</option>
          <option value="1M-5M">₦1M – ₦5M</option>
          <option value="5M-20M">₦5M – ₦20M</option>
          <option value="20M-100M">₦20M – ₦100M</option>
          <option value="100M+">Above ₦100M</option>
        </select>
      </div>

      {/* ── Areas of Interest ── */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Areas of Interest <span className="font-normal text-slate-500">(select all that apply)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_AREAS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleInterest(item)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                interests.includes(item)
                  ? "border-violet-500 bg-violet-100 text-violet-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ── LinkedIn / Website ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          LinkedIn Profile or Website
          <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>
        </label>
        <input
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      {fieldError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fieldError}</p>
      )}
    </RegisterFormShell>
  );
}
