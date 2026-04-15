"use client";

import { useState } from "react";
import Link from "next/link";
import API from "@services/api";
import AuthShell from "../../_components/AuthShell";

type StatusResponse = {
  applicationId: string;
  status: "draft" | "pending" | "approved" | "rejected" | "queued";
  account?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  farmerId?: string;
  kycPending?: boolean;
  smsTemplate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function RegisterStatusPage() {
  const [applicationId, setApplicationId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);

  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStatusData(null);

    if (!applicationId.trim() && !email.trim() && !phone.trim()) {
      setError("Enter your Farmer ID, email, or phone number.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (applicationId.trim()) params.set("applicationId", applicationId.trim());
      if (email.trim()) params.set("email", email.trim().toLowerCase());
      if (phone.trim()) params.set("phone", phone.trim());

      const res = await API.get(`/api/farmer-applications/status?${params.toString()}`);
      setStatusData(res.data as StatusResponse);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to fetch status now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Application Status"
      title="Track Farmer Application"
      subtitle="Check your onboarding status with your Farmer ID, email, or phone."
      bullets={[
        "Fast status check",
        "KYC progress indicator",
        "Works on mobile",
      ]}
      imageA={{ src: "/agropro/images/news1.jpg", alt: "Farmer checking registration status" }}
      imageB={{ src: "/agropro/images/service1.jpg", alt: "Support and onboarding guidance" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        ) : null}

        <form onSubmit={handleCheck} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Farmer ID (Application ID)
            <input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="AGR-123456"
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348012345678"
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary touch-target disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Checking status..." : "Check Status"}
          </button>
        </form>

        {statusData ? (
          <div className="mt-4 grid gap-3 rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-900">
            <p className="m-0">
              <span className="font-semibold">Farmer ID:</span> {statusData.applicationId}
            </p>
            <p className="m-0">
              <span className="font-semibold">Status:</span> {statusData.status}
            </p>
            <p className="m-0">
              <span className="font-semibold">KYC:</span> {statusData.kycPending ? "Pending additional review" : "Complete"}
            </p>
            {statusData.account?.name ? (
              <p className="m-0">
                <span className="font-semibold">Name:</span> {statusData.account.name}
              </p>
            ) : null}
            {statusData.smsTemplate ? (
              <div className="rounded-lg border border-green-200 bg-white p-3 text-xs text-slate-700">
                <p className="m-0 font-semibold text-slate-900">SMS Confirmation</p>
                <p className="m-0 mt-1">{statusData.smsTemplate}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="mb-0 mt-4 text-sm text-slate-600">
          Need account access?{" "}
          <Link href="/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            Login
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
