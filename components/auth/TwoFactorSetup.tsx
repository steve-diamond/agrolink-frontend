"use client";

import * as React from "react";
import OtpInput from "react-otp-input";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Step = "enable" | "method" | "verify" | "backup";
type Method = "sms" | "app";

export interface TwoFactorSetupProps {
  /** Called when the full setup flow completes */
  onComplete?: () => void;
  /** Called when the user cancels / skips */
  onCancel?: () => void;
  /**
   * Server action: sends a verification code.
   * Return `{ ok: true }` on success or `{ ok: false; error: string }` on failure.
   */
  onSendCode?: (method: Method, destination: string) => Promise<{ ok: boolean; error?: string }>;
  /**
   * Server action: verifies the submitted code.
   * Resolve with `{ ok: true; backupCodes: string[] }` on success.
   */
  onVerifyCode?: (
    code: string,
    method: Method,
    destination: string
  ) => Promise<{ ok: boolean; error?: string; backupCodes?: string[] }>;
  /**
   * TOTP secret used to build the QR code URI (supplied by the server).
   * If omitted a placeholder is rendered so the UI still works in storybook / dev.
   */
  totpSecret?: string;
  /** User's email address (embedded in the TOTP URI label) */
  userEmail?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
// ─────────────────────────────────────────────────────────────────────────────

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-6 w-6", className)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-5 w-5", className)}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function AppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-5 w-5", className)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h2v2h-2zm2 2h2v2h-2zm2 2h1v1h-1z" />
      <rect x="18" y="14" width="3" height="3" rx="0.5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-4 w-4", className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP digit class names
// ─────────────────────────────────────────────────────────────────────────────

const OTP_INPUT_CLASS =
  "w-12 h-14 text-xl font-semibold text-center rounded-[10px] border-[1.5px] border-slate-300 bg-white outline-none transition-colors duration-150 " +
  "focus:border-green-600 focus:ring-2 focus:ring-green-600/20 " +
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// ─────────────────────────────────────────────────────────────────────────────
// RESEND countdown hook
// ─────────────────────────────────────────────────────────────────────────────

function useResendCountdown(seconds = 60) {
  const [remaining, setRemaining] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval>>();

  const start = React.useCallback(() => {
    setRemaining(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => () => clearInterval(timerRef.current), []);

  return { remaining, start, canResend: remaining === 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: "enable", label: "Enable" },
  { key: "method", label: "Method" },
  { key: "verify", label: "Verify" },
  { key: "backup", label: "Backup" },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Setup progress">
      <ol className="flex items-center gap-0" role="list">
        {STEPS.map((step, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <React.Fragment key={step.key}>
              <li className="flex flex-col items-center gap-1" role="listitem">
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors",
                    done
                      ? "border-green-600 bg-green-600 text-white"
                      : active
                      ? "border-green-600 bg-white text-green-700"
                      : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn("text-[11px] font-medium", active ? "text-green-700" : done ? "text-green-600" : "text-slate-400")}>
                  {step.label}
                </span>
              </li>
              {i < STEPS.length - 1 && (
                <li className="flex-1 min-w-6 pb-5" role="presentation" aria-hidden>
                  <span className={cn("block h-0.5 transition-colors", i < idx ? "bg-green-600" : "bg-slate-200")} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 – Enable 2FA
// ─────────────────────────────────────────────────────────────────────────────

function EnableStep({ onNext, onCancel }: { onNext: () => void; onCancel?: () => void }) {
  const benefits = [
    "Blocks unauthorised access even if your password is stolen",
    "Required to approve large transactions and withdrawals",
    "Get instant alerts for any suspicious login attempts",
  ];

  return (
    <div className="grid gap-6">
      <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <ShieldIcon className="h-7 w-7 text-green-600" />
        </span>
        <div>
          <h3 className="text-base font-bold text-green-900">Two-factor authentication (2FA)</h3>
          <p className="mt-1 text-sm text-green-800/90 leading-relaxed">
            Add an extra layer of security to your Agrolink account. Every sign-in will require both your password and a one-time code.
          </p>
        </div>
      </div>

      <ul className="grid gap-3" aria-label="Benefits of enabling 2FA">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-3 w-3 text-green-700" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            Maybe later
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          Set up 2FA →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 – Choose Method
// ─────────────────────────────────────────────────────────────────────────────

function MethodStep({
  onNext,
  onBack,
  method,
  setMethod,
  phone,
  setPhone,
}: {
  onNext: () => void;
  onBack: () => void;
  method: Method;
  setMethod: (m: Method) => void;
  phone: string;
  setPhone: (p: string) => void;
}) {
  const [phoneError, setPhoneError] = React.useState("");

  const validate = () => {
    if (method === "sms") {
      const cleaned = phone.replace(/\s+/g, "");
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        setPhoneError("Enter a valid phone number (e.g. +2348012345678)");
        return false;
      }
    }
    setPhoneError("");
    return true;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700 mb-3">Choose your verification method</legend>
        <div className="grid gap-3">
          {/* SMS option */}
          <label
            className={cn(
              "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors",
              method === "sms" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
            )}
          >
            <input
              type="radio"
              name="2fa-method"
              value="sms"
              checked={method === "sms"}
              onChange={() => setMethod("sms")}
              className="mt-0.5 accent-green-600"
              aria-describedby="sms-desc"
            />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <PhoneIcon className="text-green-700" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">SMS Text Message</p>
              <p id="sms-desc" className="mt-0.5 text-xs text-slate-500">
                We'll send a 6-digit code to your mobile phone when you sign in.
              </p>
            </div>
          </label>

          {/* Authenticator app option */}
          <label
            className={cn(
              "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors",
              method === "app" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
            )}
          >
            <input
              type="radio"
              name="2fa-method"
              value="app"
              checked={method === "app"}
              onChange={() => setMethod("app")}
              className="mt-0.5 accent-green-600"
              aria-describedby="app-desc"
            />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <AppIcon className="text-green-700" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Authenticator App</p>
              <p id="app-desc" className="mt-0.5 text-xs text-slate-500">
                Use Google Authenticator, Authy, or any TOTP app. Works offline.
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Phone input – only shown for SMS */}
      {method === "sms" && (
        <div className="grid gap-1.5">
          <label htmlFor="2fa-phone" className="text-sm font-semibold text-slate-700">
            Phone number <span className="text-red-500" aria-hidden>*</span>
          </label>
          <input
            id="2fa-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+2348012345678"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
            aria-describedby={phoneError ? "phone-error" : undefined}
            className={cn(
              "min-h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors",
              "focus:ring-2 focus:ring-green-400 focus:ring-offset-1",
              phoneError ? "border-red-400 bg-red-50" : "border-slate-300"
            )}
          />
          {phoneError && (
            <p id="phone-error" role="alert" className="text-xs text-red-600">{phoneError}</p>
          )}
        </div>
      )}

      <div className="flex justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 – Verify Code
// ─────────────────────────────────────────────────────────────────────────────

function VerifyStep({
  method,
  phone,
  totpSecret,
  userEmail,
  onVerifyCode,
  onSendCode,
  onNext,
  onBack,
}: {
  method: Method;
  phone: string;
  totpSecret: string;
  userEmail: string;
  onVerifyCode: TwoFactorSetupProps["onVerifyCode"];
  onSendCode: TwoFactorSetupProps["onSendCode"];
  onNext: (backupCodes: string[]) => void;
  onBack: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { remaining, start, canResend } = useResendCountdown(60);
  const [sent, setSent] = React.useState(false);

  // Build the TOTP URI for QR code display
  const totpUri = `otpauth://totp/AgroLink:${encodeURIComponent(userEmail)}?secret=${totpSecret}&issuer=AgroLink&algorithm=SHA1&digits=6&period=30`;

  // Auto-send SMS on mount
  React.useEffect(() => {
    if (method === "sms" && !sent) {
      handleSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    setSent(true);
    start();
    if (onSendCode) {
      await onSendCode(method, method === "sms" ? phone : totpSecret);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await onVerifyCode?.(code, method, method === "sms" ? phone : totpSecret);
      if (result?.ok && result.backupCodes) {
        onNext(result.backupCodes);
      } else {
        setError(result?.error ?? "Incorrect code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.length > 4 ? `+${"*".repeat(phone.length - 4)}${phone.slice(-4)}` : phone;

  return (
    <div className="grid gap-6">
      {method === "app" ? (
        <div className="grid gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">1. Install an authenticator app</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP-compatible app on your phone.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">2. Scan this QR code</p>
            <div className="flex justify-center">
              <div className="rounded-xl border-4 border-white bg-white p-2 shadow-sm">
                <QRCodeSVG
                  value={totpUri}
                  size={160}
                  level="M"
                  aria-label="QR code for authenticator app setup"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Can't scan?{" "}
              <button
                type="button"
                className="font-medium text-green-700 underline hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                onClick={() => { navigator.clipboard?.writeText(totpSecret); }}
                aria-label="Copy secret key to clipboard"
              >
                Copy key manually
              </button>
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">3. Enter the 6-digit code from your app</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm text-blue-800">
            We sent a 6-digit code to <strong>{maskedPhone}</strong>.
            {!canResend && (
              <span className="ml-1 text-blue-600 tabular-nums"> Resend in {remaining}s</span>
            )}
          </p>
        </div>
      )}

      {/* OTP digit inputs */}
      <div className="grid gap-2">
        <label className="sr-only" htmlFor="otp-slot-0">Verification code</label>
        <OtpInput
          value={code}
          onChange={(val) => { setCode(val); setError(""); }}
          numInputs={6}
          renderSeparator={<span className="mx-0.5 text-slate-300" aria-hidden>–</span>}
          renderInput={(props, idx) => (
            <input
              {...props}
              id={idx === 0 ? "otp-slot-0" : undefined}
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

      {/* Resend / trouble */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {method === "sms" && (
          <button
            type="button"
            disabled={!canResend}
            onClick={handleSend}
            className="text-green-700 underline underline-offset-2 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
          >
            Resend code{!canResend && ` (${remaining}s)`}
          </button>
        )}
        <a
          href="/help/2fa-troubleshoot"
          className="ml-auto text-slate-500 hover:text-slate-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          Having trouble?
        </a>
      </div>

      <div className="flex justify-between gap-3">
        <button type="button" onClick={onBack} className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || code.length < 6}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
              Verifying…
            </>
          ) : "Verify →"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 – Backup Codes
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_CODES = Array.from({ length: 10 }, (_, i) =>
  `${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
);

function BackupCodesStep({
  codes,
  onComplete,
}: {
  codes: string[];
  onComplete: () => void;
}) {
  const displayCodes = codes.length > 0 ? codes : PLACEHOLDER_CODES;
  const [confirmed, setConfirmed] = React.useState(false);

  const downloadCodes = () => {
    const body = [
      "AgroLink – 2FA Backup Codes",
      "Generated: " + new Date().toLocaleString(),
      "",
      "Each code can be used ONCE to access your account if you lose your authenticator.",
      "Store these in a safe place.",
      "",
      ...displayCodes.map((c, i) => `${i + 1}. ${c}`),
    ].join("\n");

    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agrolink-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCodes = () => {
    const win = window.open("", "_blank", "width=500,height=700");
    if (!win) return;
    win.document.write(`
      <html lang="en">
        <head>
          <title>AgroLink Backup Codes</title>
          <style>
            body { font-family: monospace; padding: 2rem; color: #111; }
            h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
            p { color: #555; font-size: 0.875rem; }
            ol { columns: 2; column-gap: 3rem; margin-top: 1.5rem; }
            li { margin-bottom: 0.75rem; font-size: 1rem; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <h2>AgroLink – 2FA Backup Codes</h2>
          <p>Each code can be used ONCE. Store safely.</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <ol>${displayCodes.map((c) => `<li>${c}</li>`).join("")}</ol>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Save your backup codes</p>
        <p className="mt-1 text-xs text-amber-700 leading-relaxed">
          These 10 single-use codes let you access your account if you lose your device. Each code can only be used <strong>once</strong>.
        </p>
      </div>

      {/* Code grid */}
      <ol
        className="grid grid-cols-2 gap-x-4 gap-y-2"
        aria-label="Backup codes list"
      >
        {displayCodes.map((code, i) => (
          <li
            key={code}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm tracking-widest text-slate-800 select-all"
          >
            <span className="text-[10px] text-slate-400 tabular-nums w-4 shrink-0">{i + 1}.</span>
            {code}
          </li>
        ))}
      </ol>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadCodes}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <DownloadIcon />
          Download codes
        </button>
        <button
          type="button"
          onClick={printCodes}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <PrinterIcon />
          Print codes
        </button>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 p-4 transition-colors hover:border-green-300 has-checked:border-green-500 has-checked:bg-green-50">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-green-600 cursor-pointer"
          aria-describedby="confirm-desc"
        />
        <span id="confirm-desc" className="text-sm text-slate-700 leading-snug">
          I have saved my backup codes in a secure location. I understand each code can only be used once.
        </span>
      </label>

      <button
        type="button"
        onClick={onComplete}
        disabled={!confirmed}
        className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      >
        Complete setup ✓
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multi-step 2FA setup wizard.
 *
 * @example
 * <TwoFactorSetup
 *   userEmail="farmer@example.com"
 *   totpSecret="JBSWY3DPEHPK3PXP"
 *   onSendCode={async (method, dest) => { ...API call... return { ok: true }; }}
 *   onVerifyCode={async (code, method, dest) => {
 *     // returns { ok: true, backupCodes: [...] } on success
 *   }}
 *   onComplete={() => router.push("/dashboard")}
 * />
 */
export function TwoFactorSetup({
  onComplete,
  onCancel,
  onSendCode,
  onVerifyCode = async () => ({
    ok: true,
    backupCodes: PLACEHOLDER_CODES,
  }),
  totpSecret = "JBSWY3DPEHPK3PXP",
  userEmail = "user@agrolink.com.ng",
  className,
}: TwoFactorSetupProps) {
  const [step, setStep] = React.useState<Step>("enable");
  const [method, setMethod] = React.useState<Method>("app");
  const [phone, setPhone] = React.useState("");
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);

  const go = (s: Step) => setStep(s);

  return (
    <div className={cn("mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8", className)}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">Account Security</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Set up two-factor authentication</h2>
      </div>

      {/* Step indicator */}
      <div className="mb-7">
        <StepIndicator current={step} />
      </div>

      {/* Step content */}
      {step === "enable" && (
        <EnableStep
          onNext={() => go("method")}
          onCancel={onCancel}
        />
      )}
      {step === "method" && (
        <MethodStep
          onNext={() => go("verify")}
          onBack={() => go("enable")}
          method={method}
          setMethod={setMethod}
          phone={phone}
          setPhone={setPhone}
        />
      )}
      {step === "verify" && (
        <VerifyStep
          method={method}
          phone={phone}
          totpSecret={totpSecret}
          userEmail={userEmail}
          onVerifyCode={onVerifyCode}
          onSendCode={onSendCode}
          onNext={(codes) => { setBackupCodes(codes); go("backup"); }}
          onBack={() => go("method")}
        />
      )}
      {step === "backup" && (
        <BackupCodesStep
          codes={backupCodes}
          onComplete={onComplete ?? (() => {})}
        />
      )}
    </div>
  );
}
