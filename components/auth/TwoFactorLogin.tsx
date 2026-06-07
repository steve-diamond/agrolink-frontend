"use client";

import * as React from "react";
import OtpInput from "react-otp-input";
import { cn } from "@/components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LoginScreen = "code" | "backup" | "recovery";

export interface TwoFactorLoginProps {
  /** Email shown in the header (e.g. "Signing in as …") */
  userEmail?: string;
  /**
   * Called when the user submits a valid 6-digit code or backup code.
   * Resolve with `{ ok: true }` to succeed or `{ ok: false; error: string }` to show an error.
   */
  onVerify?: (
    payload: { type: "totp" | "backup"; code: string; rememberDevice: boolean }
  ) => Promise<{ ok: boolean; error?: string }>;
  /**
   * Called when the user submits a recovery request (e.g. email for recovery link).
   */
  onRequestRecovery?: (email: string) => Promise<{ ok: boolean; error?: string }>;
  /** Go back to the email/password step */
  onBack?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP digit class names
// ─────────────────────────────────────────────────────────────────────────────

const OTP_INPUT_CLASS =
  "w-12 h-14 text-[1.375rem] font-bold text-center rounded-[10px] border-[1.5px] border-slate-300 bg-white outline-none transition-colors duration-150 " +
  "focus:border-green-600 focus:ring-2 focus:ring-green-600/20 caret-green-600 " +
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// ─────────────────────────────────────────────────────────────────────────────
// Countdown hook (resend disabled window)
// ─────────────────────────────────────────────────────────────────────────────

function useCountdown(seconds = 60) {
  const [remaining, setRemaining] = React.useState(0);
  const ref = React.useRef<ReturnType<typeof setInterval>>();

  const start = React.useCallback(() => {
    setRemaining(seconds);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(ref.current); return 0; }
        return r - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => () => clearInterval(ref.current), []);
  return { remaining, start, canResend: remaining === 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
// ─────────────────────────────────────────────────────────────────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-5 w-5", className)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-5 w-5", className)}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M21 2L10 13" />
      <path d="M15 7l3 3" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-5 w-5", className)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen A – Enter TOTP code
// ─────────────────────────────────────────────────────────────────────────────

function TotpScreen({
  userEmail,
  onVerify,
  onSwitchToBackup,
  onSwitchToRecovery,
  onBack,
}: {
  userEmail: string;
  onVerify: TwoFactorLoginProps["onVerify"];
  onSwitchToBackup: () => void;
  onSwitchToRecovery: () => void;
  onBack?: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { remaining, start, canResend } = useCountdown(60);

  // auto-submit when all 6 digits entered
  React.useEffect(() => {
    if (code.length === 6) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const submit = async (value: string) => {
    if (value.length < 6) { setError("Enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await onVerify?.({ type: "totp", code: value, rememberDevice: remember });
      if (!result?.ok) {
        setError(result?.error ?? "Invalid code. Please try again.");
        setCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* context banner */}
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <ShieldIcon className="text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          Enter the 6-digit code from your <strong>authenticator app</strong> or SMS for{" "}
          <span className="font-mono">{userEmail}</span>.
        </p>
      </div>

      {/* OTP input */}
      <div className="grid gap-2">
        <label className="sr-only" htmlFor="login-otp-0">6-digit verification code</label>
        <OtpInput
          value={code}
          onChange={(val) => { setCode(val); setError(""); }}
          numInputs={6}
          renderSeparator={<span className="mx-0.5 select-none text-slate-300" aria-hidden>–</span>}
          renderInput={(props, idx) => (
            <input
              {...props}
              id={idx === 0 ? "login-otp-0" : undefined}
              autoComplete="one-time-code"
              inputMode="numeric"
              aria-label={`Digit ${idx + 1} of 6`}
              className={OTP_INPUT_CLASS}
            />
          )}
          containerStyle="flex items-center justify-center gap-1 flex-wrap"
          shouldAutoFocus
          inputType="tel"
        />
        {error && (
          <p role="alert" className="mt-1 text-center text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Remember device */}
      <label className="flex cursor-pointer items-center gap-3 select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded accent-green-600 cursor-pointer"
          aria-describedby="remember-desc"
        />
        <span id="remember-desc" className="text-sm text-slate-700">
          Remember this device for <strong>30 days</strong>
        </span>
      </label>

      {/* Verify button */}
      <button
        type="button"
        onClick={() => submit(code)}
        disabled={loading || code.length < 6}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
            Verifying…
          </>
        ) : "Verify and sign in"}
      </button>

      {/* Secondary actions */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <button
          type="button"
          disabled={!canResend}
          onClick={() => { setCode(""); start(); }}
          className="text-green-700 underline underline-offset-2 hover:text-green-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          Resend code{!canResend && ` (${remaining}s)`}
        </button>

        <button
          type="button"
          onClick={onSwitchToBackup}
          className="text-slate-600 hover:text-slate-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          Use backup code
        </button>
      </div>

      {/* Lost access */}
      <div className="border-t border-slate-100 pt-4 text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToRecovery}
          className="text-red-600 hover:text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          aria-label="Lost access to your authenticator? Start account recovery"
        >
          Lost access? Recover my account
        </button>
      </div>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
          aria-label="Go back to email and password"
        >
          <ChevronLeftIcon />
          Back to sign in
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen B – Backup code entry
// ─────────────────────────────────────────────────────────────────────────────

function BackupCodeScreen({
  userEmail,
  onVerify,
  onBack,
  onSwitchToRecovery,
}: {
  userEmail: string;
  onVerify: TwoFactorLoginProps["onVerify"];
  onBack: () => void;
  onSwitchToRecovery: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Enter your backup code."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await onVerify?.({ type: "backup", code: trimmed, rememberDevice: remember });
      if (!result?.ok) {
        setError(result?.error ?? "Invalid backup code. Each code can only be used once.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <KeyIcon className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          Enter one of your <strong>single-use backup codes</strong> for{" "}
          <span className="font-mono">{userEmail}</span>. Each code can only be used once.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="backup-code-input" className="text-sm font-semibold text-slate-700">
            Backup code
          </label>
          <input
            ref={inputRef}
            id="backup-code-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXX-XXXX"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            aria-describedby={error ? "backup-error" : undefined}
            className={cn(
              "w-full rounded-xl border px-4 py-3 font-mono text-base uppercase tracking-widest outline-none transition-colors",
              "focus:ring-2 focus:ring-green-400 focus:ring-offset-1",
              error ? "border-red-400 bg-red-50" : "border-slate-300"
            )}
          />
          {error && (
            <p id="backup-error" role="alert" className="text-xs text-red-600">{error}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-3 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded accent-green-600 cursor-pointer"
          />
          <span className="text-sm text-slate-700">Remember this device for <strong>30 days</strong></span>
        </label>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Verifying…
            </>
          ) : "Sign in with backup code"}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded">
          <ChevronLeftIcon />
          Use authenticator instead
        </button>
        <button type="button" onClick={onSwitchToRecovery} className="text-red-600 hover:text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded">
          Lost access?
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen C – Recovery (lost access)
// ─────────────────────────────────────────────────────────────────────────────

function RecoveryScreen({
  userEmail,
  onRequestRecovery,
  onBack,
}: {
  userEmail: string;
  onRequestRecovery: TwoFactorLoginProps["onRequestRecovery"];
  onBack: () => void;
}) {
  const [email, setEmail] = React.useState(userEmail);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError("Enter the email address associated with your account.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await onRequestRecovery?.(cleaned);
      if (result?.ok) {
        setSent(true);
      } else {
        setError(result?.error ?? "Could not send recovery email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
        <MailIcon className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-800">Account Recovery</p>
          <p className="mt-0.5 text-xs text-red-700">
            We'll send a secure recovery link to your registered email address.
          </p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
          <span className="text-3xl" role="img" aria-label="Email sent">📬</span>
          <p className="mt-3 text-sm font-semibold text-green-800">Recovery email sent!</p>
          <p className="mt-1 text-xs text-green-700">
            Check your inbox at <strong>{email}</strong> and follow the link within 30 minutes.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Didn't receive it? Check your spam folder or{" "}
            <button type="button" onClick={() => setSent(false)} className="underline text-green-700 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded">
              try again
            </button>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <label htmlFor="recovery-email" className="text-sm font-semibold text-slate-700">
              Account email address
            </label>
            <input
              ref={inputRef}
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              aria-describedby={error ? "recovery-error" : "recovery-hint"}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors",
                "focus:ring-2 focus:ring-green-400 focus:ring-offset-1",
                error ? "border-red-400 bg-red-50" : "border-slate-300"
              )}
            />
            {error ? (
              <p id="recovery-error" role="alert" className="text-xs text-red-600">{error}</p>
            ) : (
              <p id="recovery-hint" className="text-xs text-slate-500">
                Must match the email you registered with.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                Sending…
              </>
            ) : "Send recovery email"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
      >
        <ChevronLeftIcon />
        Back
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────

const SCREEN_TITLE: Record<LoginScreen, string> = {
  code: "Two-factor verification",
  backup: "Enter backup code",
  recovery: "Account recovery",
};

const SCREEN_SUBTITLE: Record<LoginScreen, string> = {
  code: "Your account is protected with two-factor authentication.",
  backup: "Use a backup code to access your account.",
  recovery: "Let's help you regain access to your account.",
};

/**
 * 2FA verification screen shown after a successful email/password login.
 * Handles TOTP code entry, backup code fallback, and account recovery.
 *
 * @example
 * <TwoFactorLogin
 *   userEmail="farmer@example.com"
 *   onVerify={async ({ type, code, rememberDevice }) => {
 *     const res = await verifyTwoFactor({ type, code, rememberDevice });
 *     return res.ok ? { ok: true } : { ok: false, error: res.message };
 *   }}
 *   onBack={() => setStep("password")}
 * />
 */
export function TwoFactorLogin({
  userEmail = "user@agrolink.com.ng",
  onVerify,
  onRequestRecovery,
  onBack,
  className,
}: TwoFactorLoginProps) {
  const [screen, setScreen] = React.useState<LoginScreen>("code");

  return (
    <div className={cn("mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8", className)}>
      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <ShieldIcon className="h-6 w-6 text-green-600" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {SCREEN_TITLE[screen]}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{SCREEN_SUBTITLE[screen]}</p>
        </div>
      </div>

      {/* Screen content */}
      {screen === "code" && (
        <TotpScreen
          userEmail={userEmail}
          onVerify={onVerify}
          onSwitchToBackup={() => setScreen("backup")}
          onSwitchToRecovery={() => setScreen("recovery")}
          onBack={onBack}
        />
      )}
      {screen === "backup" && (
        <BackupCodeScreen
          userEmail={userEmail}
          onVerify={onVerify}
          onBack={() => setScreen("code")}
          onSwitchToRecovery={() => setScreen("recovery")}
        />
      )}
      {screen === "recovery" && (
        <RecoveryScreen
          userEmail={userEmail}
          onRequestRecovery={onRequestRecovery}
          onBack={() => setScreen("code")}
        />
      )}
    </div>
  );
}
