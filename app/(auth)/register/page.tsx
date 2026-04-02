"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

export default function RegisterPage() {
  const router = useRouter();
  const { copy } = useLocalizedCopy();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer" as "buyer" | "farmer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main className="mx-auto grid max-w-xl gap-4 py-6">
      <section className="card bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50">
        <h1 className="m-0 text-3xl font-bold">{copy.createAccount}</h1>
        <p className="mb-0 mt-1 text-sm text-green-100">{copy.tagline}</p>
      </section>

      <section className="card p-5">
        <p className="mt-0 text-sm text-slate-600">Join DOS AGROLINK NIGERIA as a buyer or farmer.</p>

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
            <input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
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
    </main>
  );
}
