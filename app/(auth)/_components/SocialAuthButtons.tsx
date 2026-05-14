"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Google Identity Services global type                               */
/* ------------------------------------------------------------------ */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (r: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            cb?: (n: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
type SocialAuthButtonsProps = {
  /** Called on successful auth instead of the default router redirect */
  onSuccess?: (token: string, user: Record<string, unknown>) => void;
  /** Role to assign when a brand-new account is created via social/OTP */
  defaultRole?: "buyer" | "farmer" | "cooperative" | "logistics" | "warehouse" | "investor";
  /** Show the top "or continue with" divider (default true) */
  showDivider?: boolean;
};

/* ================================================================== */
export default function SocialAuthButtons({
  onSuccess,
  defaultRole = "buyer",
  showDivider = true,
}: SocialAuthButtonsProps) {
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [gisReady, setGisReady] = useState(false);
  const [loading, setLoading] = useState<"google" | "otp" | "otp-verify" | null>(null);
  const [error, setError] = useState("");

  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpRef, setOtpRef] = useState("");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  /* ---- Load GIS script ------------------------------------------ */
  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;
    if (window.google?.accounts) {
      setGisReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [clientId]);

  /* ---- Init GIS once script is ready ----------------------------- */
  useEffect(() => {
    if (!gisReady || !clientId || !window.google?.accounts) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gisReady, clientId]);

  /* ---- Helpers --------------------------------------------------- */
  const finishAuth = (token: string, user: Record<string, unknown>) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (onSuccess) { onSuccess(token, user); return; }
    const role = user?.role as string;
    if (role === "admin") router.push("/admin");
    else if (role === "farmer") router.push("/farmer");
    else if (role === "investor") router.push("/investor");
    else router.push("/dashboard");
  };

  /* ---- Google handler -------------------------------------------- */
  const handleGoogleCredential = async (res: { credential: string }) => {
    setLoading("google");
    setError("");
    try {
      const r = await fetch("/api/auth/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: res.credential, role: defaultRole }),
      });
      const json = await r.json();
      if (!r.ok || json.status !== "success") {
        setError(json.message ?? "Google sign-in failed. Please try again.");
        return;
      }
      finishAuth(json.data.token, json.data.user);
    } catch {
      setError("Google sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(null);
    }
  };

  const triggerGoogle = () => {
    if (!window.google?.accounts) {
      setError("Google Sign-In is not available. Check your internet connection.");
      return;
    }
    window.google.accounts.id.prompt((n) => {
      /* One-tap was suppressed — fall back to renderButton click */
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        if (googleBtnRef.current) {
          window.google!.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            size: "large",
            theme: "outline",
            text: "continue_with",
            width: 400,
          });
          const btn = googleBtnRef.current.querySelector<HTMLElement>("div[role=button]");
          btn?.click();
        }
      }
    });
  };

  /* ---- OTP handlers ---------------------------------------------- */
  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setLoading("otp");
    setError("");
    try {
      const r = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const json = await r.json();
      if (!r.ok || json.status !== "success") {
        setError(json.message ?? "Could not send OTP. Please try again.");
        return;
      }
      setOtpRef(json.data?.ref ?? "");
      setOtpSent(true);
    } catch {
      setError("Could not send OTP. Check your connection.");
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    setLoading("otp-verify");
    setError("");
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), ref: otpRef, role: defaultRole }),
      });
      const json = await r.json();
      if (!r.ok || json.status !== "success") {
        setError(json.message ?? "Invalid OTP. Please try again.");
        return;
      }
      finishAuth(json.data.token, json.data.user);
    } catch {
      setError("OTP verification failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  /* ================================================================ */
  return (
    <div className="grid gap-3">
      {/* Divider */}
      {showDivider && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-green-100" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            or continue with
          </span>
          <div className="h-px flex-1 bg-green-100" />
        </div>
      )}

      {/* Social buttons */}
      <div className={`grid gap-2 ${clientId ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {clientId && (
          <button
            type="button"
            onClick={triggerGoogle}
            disabled={!!loading || !gisReady}
            className="social-btn"
            aria-label="Continue with Google"
          >
            {loading === "google" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            <span>{loading === "google" ? "Connecting…" : "Google"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => { setShowPhone((p) => !p); setError(""); }}
          disabled={!!loading}
          className="social-btn"
          aria-label="Continue with Phone / OTP"
        >
          <PhoneIcon />
          <span>Phone / OTP</span>
        </button>
      </div>

      {/* Hidden GIS fallback render target */}
      <div ref={googleBtnRef} className="hidden" aria-hidden="true" />

      {/* Phone OTP panel */}
      {showPhone && (
        <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 grid gap-3 text-sm">
          {!otpSent ? (
            <>
              <label className="grid gap-1 font-semibold text-green-950">
                Phone number
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-lg border border-green-200 bg-white px-3 text-slate-500 select-none text-xs">
                    +234
                  </span>
                  <input
                    type="tel"
                    placeholder="8012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    className="min-h-10 flex-1 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
                  />
                </div>
              </label>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading === "otp" || phone.trim().length < 9}
                className="btn-primary py-2 text-sm"
              >
                {loading === "otp" ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="m-0 text-slate-600">
                Enter the 6-digit code sent to{" "}
                <strong>+234{phone.replace(/^0/, "")}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="· · · · · ·"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="min-h-10 rounded-lg border border-green-200 bg-white px-3 tracking-[0.3em] text-center outline-none ring-green-200 focus:ring"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading === "otp-verify" || otp.length < 4}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  {loading === "otp-verify" ? "Verifying…" : "Verify & Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); setOtpRef(""); }}
                  className="rounded-lg border border-green-200 bg-white px-3 py-2 text-green-700 hover:bg-green-50"
                >
                  Resend
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                               */
/* ------------------------------------------------------------------ */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.01 21 3 13.99 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57-.11.35-.02.74-.24 1.01l-2.21 2.21z" />
    </svg>
  );
}
