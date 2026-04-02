"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await API.post("/api/auth/login", form);
      const user = res.data.user;

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
      setError(err?.response?.data?.message || "Admin login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[420px] px-5 py-8">
      <h1 className="text-3xl font-semibold text-slate-900">Admin Login</h1>
      <p className="mt-2 text-slate-500">Sign in with an admin account to access the admin dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Admin email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md px-4 py-2 text-white ${
            isSubmitting ? "cursor-not-allowed bg-slate-400" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isSubmitting ? "Signing in..." : "Login as Admin"}
        </button>
      </form>
    </main>
  );
}
