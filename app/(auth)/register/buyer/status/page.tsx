"use client";

import { Suspense, useState } from "react";
import API from "@/services/api";
import AuthShell from "../../../_components/AuthShell";

type StatusResponse = {
  status: "pending" | "approved" | "rejected" | "queued";
  applicationId: string;
  submittedAt?: string;
  updatedAt?: string;
  buyerId?: string;
  message?: string;
};

function BuyerStatusContent() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StatusResponse | null>(null);

  const lookupStatus = async () => {
    setError("");
    setResult(null);

    const value = query.trim();
    if (!value) {
      setError("Enter your buyer application ID, email, or phone.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.get("/api/buyer-applications/status", {
        params: {
          applicationId: value,
          email: value,
          phone: value,
        },
      });
      setResult(response.data as StatusResponse);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        setError((err.response as { data?: { message?: string } })?.data?.message || "Unable to find application status right now.");
      } else {
        setError("Unable to find application status right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusTone = (status: string) => {
    if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-900";
    if (status === "rejected") return "border-red-200 bg-red-50 text-red-900";
    if (status === "queued") return "border-amber-200 bg-amber-50 text-amber-900";
    return "border-blue-200 bg-blue-50 text-blue-900";
  };

  return (
    <AuthShell
      eyebrow="Buyer Status"
      title="Track Buyer Application"
      subtitle="Check your buyer onboarding review status with your application ID, email, or phone."
      bullets={[
        "Works with application ID, email, or phone",
        "Shows current review stage",
        "Updates after verification checks",
      ]}
      imageA={{ src: "/agropro/images/service4.jpg", alt: "Buyer reviewing produce samples" }}
      imageB={{ src: "/agropro/images/news3.jpg", alt: "Agricultural trade logistics" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <label className="grid gap-2 text-sm font-semibold text-green-950">
          Buyer application ID, email, or phone
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="AGR-BUY-12345 or buyer@example.com"
            className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
        </label>

        <button
          type="button"
          onClick={lookupStatus}
          disabled={loading}
          className="mt-3 min-h-12 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        {result ? (
          <div className={`mt-4 rounded-lg border p-4 ${statusTone(result.status)}`}>
            <p className="m-0 text-sm font-semibold">Status: {result.status.toUpperCase()}</p>
            <p className="m-0 mt-1 text-sm">Application ID: {result.applicationId}</p>
            {result.buyerId ? <p className="m-0 mt-1 text-sm">Buyer ID: {result.buyerId}</p> : null}
            {result.submittedAt ? <p className="m-0 mt-1 text-sm">Submitted: {new Date(result.submittedAt).toLocaleString()}</p> : null}
            {result.updatedAt ? <p className="m-0 mt-1 text-sm">Updated: {new Date(result.updatedAt).toLocaleString()}</p> : null}
            {result.message ? <p className="m-0 mt-2 text-sm">{result.message}</p> : null}
          </div>
        ) : null}
      </section>
    </AuthShell>
  );
}

export default function BuyerStatusPage() {
  return (
    <Suspense fallback={null}>
      <BuyerStatusContent />
    </Suspense>
  );
}
