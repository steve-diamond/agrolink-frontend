
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const extractLoginError = (payload: unknown): string => {
    if (!payload || typeof payload !== "object") {
      return "Login failed. Please check your credentials.";
    }

    const body = payload as Record<string, unknown>;
    const message = typeof body.message === "string" ? body.message : null;
    const error = typeof body.error === "string" ? body.error : null;
    const nested = body.data && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : null;
    const nestedMessage = nested && typeof nested.message === "string" ? nested.message : null;

    return message || error || nestedMessage || "Login failed. Please check your credentials.";
  };

  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setError("Unable to process server response. Please try again.");
        return;
      }

      const body = json as {
        status?: string;
        success?: boolean;
        data?: { user?: { role?: string }; token?: string };
      };
      const isSuccess = body.status === "success" || body.success === true;

      if (!res.ok || !isSuccess || !body.data?.user || !body.data?.token) {
        setError(extractLoginError(json));
        return;
      }

      const { user, token } = body.data;

      if (user.role !== "admin") {
        setError("Access denied. This portal is for administrators only.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/admin");
    } catch {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
            Admin Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">AgroLink Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in with your administrator credentials
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="admin@agrolink.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-16 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/admin/forgot-password"
              className="text-xs text-green-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Not an admin?{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            Go to main login
          </Link>
        </p>
      </div>
    </main>
  );
}
