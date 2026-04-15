// Migrated from agrolink/agrolink/src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: { data?: { message?: string; error?: string } };
    };
    const message = candidate.response?.data?.message || candidate.response?.data?.error;
    if (message && /buffering timed out|server selection timed out|mongodb|mongo|econnrefused/i.test(message)) {
      return "Service is temporarily unavailable. Please try again shortly.";
    }
    return message;
  }
  return undefined;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farmer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await API.post("/api/auth/register", form);
      router.push("/login");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError) || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="card intention">
        <h1>Register</h1>
        <p>Create an account to sell produce, track performance, and access finance tools.</p>
        <form className="gridTwo" onSubmit={handleSubmit}>
          <label className="infoCard card">
            <span>Full Name</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required className="language" />
          </label>
          <label className="infoCard card">
            <span>Email</span>
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" required className="language" />
          </label>
          <label className="infoCard card">
            <span>Password</span>
            <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" required minLength={6} className="language" />
          </label>
          <label className="infoCard card">
            <span>Role</span>
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="language">
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>
          {error ? <p className="card infoCard">{error}</p> : null}
          <button className="btn btnPrimary" type="submit" disabled={submitting}>{submitting ? "Creating account..." : "Register"}</button>
        </form>
      </section>
    </main>
  );
}
