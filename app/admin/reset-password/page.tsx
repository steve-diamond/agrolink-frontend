"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "../../(auth)/_components/AuthShell";
import PasswordEyeIcon from "../../(auth)/_components/PasswordEyeIcon";
import API from "@/services/api";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Start again from admin forgot password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/api/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to reset admin password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin Recovery"
      title="Reset Admin Password"
      subtitle="Set a new secure password for your administrator account."
      bullets={[
        "Token-gated administrator recovery",
        "Strong-password policy enforced",
        "Fast restoration of dashboard access",
      ]}
      imageA={{ src: "/agropro/images/service1.jpg", alt: "Enterprise operations support" }}
      imageB={{ src: "/agropro/images/news3.jpg", alt: "Admin monitoring center" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Admin Reset</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Create New Admin Password</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Use a strong password to secure administrator access.</p>
        </div>

        {error ? <p className="m-0 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="m-0 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Admin password reset successful. Redirecting...</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            New password
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="min-h-12 w-full rounded-lg border border-green-200 px-3 pr-20 outline-none ring-green-200 focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <PasswordEyeIcon visible={showPassword} />
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Confirm password
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="min-h-12 w-full rounded-lg border border-green-200 px-3 pr-20 outline-none ring-green-200 focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-100"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <PasswordEyeIcon visible={showConfirmPassword} />
                <span>{showConfirmPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary touch-target mt-1 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Resetting..." : "Reset Admin Password"}
          </button>
        </form>

        <p className="mb-0 mt-5 text-sm text-slate-600">
          Back to admin sign in?{" "}
          <Link href="/admin/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            Return to login
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
