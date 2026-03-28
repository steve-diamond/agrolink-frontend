"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type AuthUser = {
  name: string;
  role: "farmer" | "buyer" | "admin";
};

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  // Re-read user state whenever the route changes so nav reacts to login/logout.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const linkStyle = { color: "#cbd5e1", textDecoration: "none" as const, fontSize: "14px" };
  const accentLink = { ...linkStyle, color: "#86efac" };
  const adminLink = { ...linkStyle, color: "#fde047" };

  return (
    <nav
      style={{
        padding: "12px 20px",
        background: "#0f172a",
        color: "white",
        display: "flex",
        gap: "18px",
        alignItems: "center",
        flexWrap: "wrap" as const,
        borderBottom: "1px solid #1e293b",
      }}
    >
      <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 700, fontSize: "16px", marginRight: "8px" }}>
        AgroLink
      </Link>

      <Link href="/marketplace" style={linkStyle}>Marketplace</Link>

      {user ? (
        <>
          <Link href="/dashboard" style={linkStyle}>Dashboard</Link>

          {user.role === "farmer" && (
            <Link href="/farmer/upload" style={accentLink}>Upload Product</Link>
          )}

          {user.role === "buyer" && (
            <Link href="/orders" style={linkStyle}>My Orders</Link>
          )}

          {user.role === "admin" && (
            <Link href="/admin" style={adminLink}>Admin Panel</Link>
          )}

          <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "12px" }}>
            {user.name} · {user.role}
          </span>

          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #475569",
              borderRadius: "6px",
              color: "#f1f5f9",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <div style={{ marginLeft: "auto", display: "flex", gap: "14px", alignItems: "center" }}>
            <Link href="/login" style={linkStyle}>Login</Link>
            <Link href="/register" style={{ ...accentLink, border: "1px solid #16a34a", padding: "4px 12px", borderRadius: "6px" }}>
              Register
            </Link>
            <Link href="/admin/login" style={adminLink}>Admin</Link>
          </div>
        </>
      )}
    </nav>
  );
}
