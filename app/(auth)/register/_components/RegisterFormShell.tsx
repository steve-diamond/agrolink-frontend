"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "../../_components/AuthShell";
import PasswordEyeIcon from "../../_components/PasswordEyeIcon";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  organizationName?: string;
  inviteCode?: string;
  metadata?: Record<string, unknown>;
};

type Props = {
  /** Left-panel AuthShell props */
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  imageA: { src: string; alt: string };
  imageB: { src: string; alt: string };

  /** Role sent to the API */
  role: string;

  /** Extra fields rendered between phone and submit */
  children?: ReactNode;

  /**
   * Called before submit — must return the extra payload fields
   * (organizationName, metadata, inviteCode …).
   * Return null to cancel submission (e.g. failed client-side validation).
   */
  buildPayload?: (base: RegisterPayload) => RegisterPayload | null;

  /** Override the default post-success redirect */
  successRedirect?: string;
};

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];
  const textColors = ["text-red-600", "text-amber-700", "text-yellow-700", "text-emerald-700"];
  const idx = Math.max(0, score - 1);

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex flex-1 gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[idx] : "bg-slate-200"}`}
          />
        ))}
      </div>
      <span className={`text-xs font-semibold ${textColors[idx]}`}>{labels[idx]}</span>
    </div>
  );
}

export default function RegisterFormShell({
  eyebrow,
  title,
  subtitle,
  bullets,
  imageA,
  imageB,
  role,
  children,
  buildPayload,
  successRedirect,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const base: RegisterPayload = { name, email, phone, password, role };
    const payload = buildPayload ? buildPayload(base) : base;
    if (!payload) return; // cancelled by caller

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        setError(json.message || "Registration failed. Please try again.");
        return;
      }

      const params = new URLSearchParams({ role, name });
      router.push(successRedirect ?? `/register/success?${params.toString()}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      bullets={bullets}
      imageA={imageA}
      imageB={imageB}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        {/* Header */}
        <div className="mb-5">
          <h2 className="m-0 text-xl font-extrabold text-green-900">{title}</h2>
          <p className="m-0 mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="mb-1 block text-sm font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="reg-phone" className="mb-1 block text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="08012345678"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <PasswordEyeIcon visible={showPassword} />
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Role-specific fields injected here */}
          {children}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-1 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>

          <p className="m-0 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-green-700 hover:underline">
              Log in
            </Link>
          </p>
          <p className="m-0 text-center text-sm text-slate-600">
            Not this role?{" "}
            <Link href="/register/select-role" className="font-semibold text-green-700 hover:underline">
              Choose another role
            </Link>
          </p>
        </form>
      </section>
    </AuthShell>
  );
}
