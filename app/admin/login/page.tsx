"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";
import AuthShell from "../../(auth)/_components/AuthShell";
import Link from "next/link";
import PasswordEyeIcon from "../../(auth)/_components/PasswordEyeIcon";
import useRememberedEmail from "../../(auth)/_components/useRememberedEmail";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rememberEmail, setRememberEmail, rememberedEmail, persistRememberedEmail } = useRememberedEmail("agrolink-admin-remembered-email");

  useEffect(() => {
    if (rememberedEmail) {
      setForm((prev) => ({ ...prev, email: rememberedEmail }));
    }
  }, [rememberedEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/api/auth/login", form);
      const user = res.data.user;

      persistRememberedEmail(form.email);

      if (user?.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Access denied. Admin account required.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/admin");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Admin login failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin Access"
      title="Admin Login"
      subtitle="Sign in with your approved administrator account to manage subscriptions, users, inventory, and platform operations."
      bullets={[
        "Role-gated administrator access",
        "Secure token-based session control",
        "Monitoring and operational tooling",
      ]}
      imageA={{ src: "/agropro/images/service2.jpg", alt: "Admin operations and analytics desk" }}
      imageB={{ src: "/agropro/images/news2.jpg", alt: "Agricultural supply chain logistics" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Admin Access</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Protected Sign-In</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Only verified admin profiles can continue into the control dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Admin email
            <input
              name="email"
              type="email"
              placeholder="admin@dosagrolink.ng"
              value={form.email}
              onChange={handleChange}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Password
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
            <Link href="/admin/forgot-password" className="font-semibold text-green-700 no-underline hover:text-green-800">
              Forgot password?
            </Link>
          </div>

          {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary touch-target mt-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Login as Admin"}
          </button>
        </form>
      </section>
    </AuthShell>
  );
}
