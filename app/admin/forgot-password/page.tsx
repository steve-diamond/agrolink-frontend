"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "../../(auth)/_components/AuthShell";
import API from "@services/api";
import { useRouter } from "next/navigation";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/api/auth/forgot-password", { email, role: "admin" });
      const resetToken = res?.data?.resetToken;

      setSent(true);

      if (resetToken) {
        router.push(`/admin/reset-password?token=${encodeURIComponent(resetToken)}`);
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        // @ts-expect-error: err.response is not typed, but may exist on error objects from axios
        setError(err.response?.data?.message || "Unable to process admin reset request right now.");
      } else {
        setError("Unable to process admin reset request right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin Recovery"
      title="Admin Password Help"
      subtitle="Request secure recovery for your administrator account. Our support team will verify and guide the reset process."
      bullets={[
        "Admin-only account verification",
        "Support-led secure reset workflow",
        "Operational access restoration",
      ]}
      imageA={{ src: "/agropro/images/news3.jpg", alt: "Operations and monitoring team" }}
      imageB={{ src: "/agropro/images/service1.jpg", alt: "Enterprise agricultural operations" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Admin Recovery</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Submit Admin Reset Request</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Use your admin email to start a verified password recovery request.</p>
        </div>

        {sent ? (
          <p className="m-0 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            If your admin account exists, reset instructions have been initiated.
          </p>
        ) : null}

        {error ? <p className="m-0 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Admin email
            <input
              type="email"
              placeholder="admin@dosagrolink.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary touch-target mt-1 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Submitting..." : "Send Admin Request"}
          </button>
        </form>

        <p className="mb-0 mt-5 text-sm text-slate-600">
          Back to admin login?{" "}
          <Link href="/admin/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            Return to sign in
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
