"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useRouter } from "next/navigation";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

function LoginForm() {
  const router = useRouter();
  const { copy } = useLocalizedCopy();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/api/auth/login", form);

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
    <main className="mx-auto grid max-w-xl gap-4 py-6">
      <section className="card bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50">
        <h1 className="m-0 text-3xl font-bold">{copy.login}</h1>
        <p className="mb-0 mt-1 text-sm text-green-100">{copy.tagline}</p>
        <p className="mb-0 mt-3 inline-flex w-fit rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold">
          2G-friendly mode enabled
        </p>
      </section>

      {registered && (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Account created! Please log in.
        </p>
      )}

      <section className="card p-5">
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
            <input
              name="password"
              type="password"
              placeholder={copy.password}
              value={form.password}
              onChange={handleChange}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="btn-primary touch-target">
            {isSubmitting ? "Logging in..." : copy.login}
          </button>
        </form>

        <p className="mb-0 mt-4 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-green-700 no-underline hover:text-green-800">{copy.register}</Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}