"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useRouter } from "next/navigation";
import { useLocalizedCopy } from "@services/useLocalizedCopy";
import AuthShell from "../_components/AuthShell";
import PasswordEyeIcon from "../_components/PasswordEyeIcon";
import useRememberedEmail from "../_components/useRememberedEmail";

function LoginForm() {
  const router = useRouter();
  const { copy } = useLocalizedCopy();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rememberEmail, setRememberEmail, rememberedEmail, persistRememberedEmail } = useRememberedEmail("agrolink-remembered-email");

  useEffect(() => {
    if (rememberedEmail) {
      setForm((prev) => ({ ...prev, email: rememberedEmail }));
    }
  }, [rememberedEmail]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/api/auth/login", form);

      persistRememberedEmail(form.email);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed";
      setError(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Access"
      title={copy.login}
      subtitle="Digital marketplace for Nigerian smallholder farmers, cooperatives, and trusted buyers."
      bullets={[
        "Direct farmer-to-market access",
        "Secure order and payment workflow",
        "2G-friendly mode enabled",
      ]}
      imageA={{ src: "/agropro/images/banner.jpg", alt: "Farm produce ready for market" }}
      imageB={{ src: "/agropro/images/about_img1.jpg", alt: "Nigerian farmer in the field" }}
    >
        <section className="card rounded-2xl p-5 sm:p-7">
          <div className="mb-5">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Account Access</p>
            <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Welcome back</h2>
            <p className="mb-0 mt-1 text-sm text-slate-600">Sign in to continue to your dashboard and active marketplace orders.</p>
          </div>

          {registered && (
            <p className="m-0 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Account created! Please log in.
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">
              {copy.email}
              <input
                name="email"
                type="email"
                placeholder={copy.email}
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
                  placeholder={copy.password}
                  value={form.password}
                  onChange={handleChange}
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

            <div className="mt-1 flex items-center justify-between gap-3 text-sm text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-green-300 text-green-700 focus:ring-green-200"
                />
                Remember my email
              </label>
              <Link href="/forgot-password" className="font-semibold text-green-700 no-underline hover:text-green-800">
                Forgot password?
              </Link>
            </div>

            {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary touch-target mt-1">
              {isSubmitting ? "Logging in..." : copy.login}
            </button>
          </form>

          <p className="mb-0 mt-5 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-green-700 no-underline hover:text-green-800">{copy.register}</Link>
          </p>
        </section>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}