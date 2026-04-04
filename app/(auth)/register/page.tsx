"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";
import AuthShell from "../_components/AuthShell";
import PasswordEyeIcon from "../_components/PasswordEyeIcon";

export default function RegisterPage() {
  const router = useRouter();
  const { copy } = useLocalizedCopy();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer" as "buyer" | "farmer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { label: "", toneClass: "text-slate-500", score: 0 };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: "Weak password", toneClass: "text-red-600", score };
    if (score <= 2) return { label: "Fair password", toneClass: "text-amber-700", score };
    if (score === 3) return { label: "Good password", toneClass: "text-emerald-700", score };
    return { label: "Strong password", toneClass: "text-emerald-800", score };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/api/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      router.push("/login?registered=1");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create Account"
      title={copy.createAccount}
      subtitle="Join DOS AGROLINK NIGERIA to buy or sell verified agricultural produce across trusted local supply chains."
      bullets={[
        "Buyer and farmer account types",
        "Role-based onboarding workflow",
        "Fast registration on low bandwidth",
      ]}
      imageA={{ src: "/agropro/images/about_img.jpg", alt: "Farmer inspecting fresh crops" }}
      imageB={{ src: "/agropro/images/chose.jpg", alt: "Harvested produce in curated baskets" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Create Account</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Get started on Agrolink</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Choose your role and create your profile to access the digital agri-marketplace.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.fullName}
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.email}
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.password}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
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
            {passwordStrength.label ? (
              <div className="grid gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 1
                        ? "bg-red-500"
                        : passwordStrength.score <= 2
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                    } ${
                      passwordStrength.score <= 0
                        ? "w-0"
                        : passwordStrength.score === 1
                          ? "w-1/4"
                          : passwordStrength.score === 2
                            ? "w-2/4"
                            : passwordStrength.score === 3
                              ? "w-3/4"
                              : "w-full"
                    }`}
                  />
                </div>
                <p className={`m-0 text-xs font-semibold ${passwordStrength.toneClass}`}>{passwordStrength.label}</p>
              </div>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.buyer} / {copy.farmer}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
            >
              <option value="buyer">{copy.buyer} - browse and purchase produce</option>
              <option value="farmer">{copy.farmer} - list and sell produce</option>
            </select>
          </label>

          {form.role === "farmer" && (
            <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Farmer accounts require admin approval before you can list products.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary touch-target disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : copy.createAccount}
          </button>
        </form>

        <p className="mb-0 mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            {copy.login}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
