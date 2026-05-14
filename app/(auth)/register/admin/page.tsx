"use client";

import { useState } from "react";
import RegisterFormShell, { type RegisterPayload } from "../_components/RegisterFormShell";

const DEPARTMENTS = [
  "Operations",
  "Finance",
  "Technology / Engineering",
  "Compliance & Risk",
  "Customer Success",
  "Marketing",
  "Human Resources",
  "Executive",
] as const;

export default function AdminRegisterPage() {
  const [employeeId, setEmployeeId]   = useState("");
  const [department, setDepartment]   = useState("");
  const [inviteCode, setInviteCode]   = useState("");
  const [showCode, setShowCode]       = useState(false);
  const [fieldError, setFieldError]   = useState("");

  function buildPayload(base: RegisterPayload): RegisterPayload | null {
    if (!employeeId.trim()) {
      setFieldError("Employee ID is required.");
      return null;
    }
    if (!department) {
      setFieldError("Please select your department.");
      return null;
    }
    if (!inviteCode.trim()) {
      setFieldError("Invite code is required.");
      return null;
    }
    setFieldError("");
    return {
      ...base,
      inviteCode: inviteCode.trim(),
      metadata: {
        employeeId: employeeId.trim(),
        department,
      },
    };
  }

  return (
    <RegisterFormShell
      role="admin"
      eyebrow="Admin Registration — Invite Only"
      title="Create an Admin Account"
      subtitle="For DOS AgroLink Nigeria staff only. A valid invite code issued by the CTO or CEO is required."
      bullets={[
        "Approve users, products, and loans",
        "Manage platform settings",
        "View full analytics and reporting",
        "Oversee all platform activity",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Platform administration dashboard" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "AgroLink operations overview" }}
      buildPayload={buildPayload}
      successRedirect="/admin"
    >
      {/* ── Security notice ── */}
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
        <span className="text-base" aria-hidden="true">🔐</span>
        <p className="m-0">
          This page is for <strong>authorised DOS AgroLink staff only</strong>. Unauthorised attempts
          are logged and may result in legal action.
        </p>
      </div>

      {/* ── Employee ID ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Employee ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
          placeholder="e.g. DOS-EMP-001"
        />
      </div>

      {/* ── Department ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          aria-label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="block w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* ── Invite Code ── */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Admin Invite Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showCode ? "text" : "password"}
            required
            autoComplete="off"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="block w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            placeholder="Enter your invite code"
          />
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            {showCode ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Obtain this code from the CTO or CEO before proceeding.
        </p>
      </div>

      {fieldError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{fieldError}</p>
      )}
    </RegisterFormShell>
  );
}
