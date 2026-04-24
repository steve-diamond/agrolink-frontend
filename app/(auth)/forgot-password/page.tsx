"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "../_components/AuthShell";
import API from "@/services/api";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
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
      const res = await API.post("/api/auth/forgot-password", { email });
      const resetToken = res?.data?.resetToken;

      setSent(true);

      if (resetToken) {
        router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
      }
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
        // Type guard for error
        setError((err.response as { data?: { message?: string } })?.data?.message || "Unable to process reset request right now.");
      } else {
        setError("Unable to process reset request right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Forgot Password"
      subtitle="Recover your access quickly. Submit your registered email and we will guide you through a secure password reset process."
      bullets={[
        "Secure account recovery workflow",
        "Response from DOS Agrolink support",
        "Fast assistance for marketplace users",
      ]}
      imageA={{ src: "/agropro/images/news1.jpg", alt: "Support representative assisting a customer" }}
      imageB={{ src: "/agropro/images/service3.jpg", alt: "Agricultural service coordination" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Account Recovery</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Reset Support Request</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Enter the email linked to your account and send your request to our support team.</p>
        </div>

        {sent ? (
          <p className="m-0 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            If your account exists, reset instructions have been initiated. Check your configured reset channel.
          </p>
        ) : null}

        {error ? <p className="m-0 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Registered email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary touch-target mt-1 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Submitting..." : "Send Reset Request"}
          </button>
        </form>

        <p className="mb-0 mt-5 text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            Return to login
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
