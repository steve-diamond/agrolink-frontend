"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
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
    <main style={{ padding: "20px" }}>
      <h1>Login</h1>

      {registered && (
        <p style={{ background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: "8px", border: "1px solid #86efac", marginBottom: "16px" }}>
          Account created! Please log in.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br /><br />

        {error ? <p style={{ color: "red" }}>{error}</p> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "16px", color: "#64748b" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "#16a34a", fontWeight: 600 }}>Register here</Link>
      </p>
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