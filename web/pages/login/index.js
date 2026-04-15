// Migrated from agrolink/agrolink/src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAppShell } from "@/components/AppShell";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: { data?: { message?: string; error?: string } };
    };
    return candidate.response?.data?.message || candidate.response?.data?.error;
  }
  return undefined;
};

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAppShell();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await API.post("/api/auth/login", { email, password });
      setSession(response.data.token, response.data.user);
      router.push("/");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError) || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="card intention">
        <h1>Login</h1>
        <p>Access your market data, farm records, and finance tools.</p>
        <form className="gridTwo" onSubmit={handleSubmit}>
          <label className="infoCard card">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="language" />
          </label>
          <label className="infoCard card">
            <span>Password</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="language" />
          </label>
          {error ? <p className="card infoCard">{error}</p> : null}
          <button className="btn btnPrimary" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</button>
        </form>
      </section>
    </main>
  );
}
