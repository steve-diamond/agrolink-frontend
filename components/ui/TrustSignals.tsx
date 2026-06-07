"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";
import { Tooltip } from "./Tooltip";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const PRIVACY_POLICY_HREF = "/privacy-policy";

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons
// ─────────────────────────────────────────────────────────────────────────────

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldLockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-5 w-5 shrink-0", className)}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9a2 2 0 1 1 4 0v2" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.293a1 1 0 0 0-1.414 0L10 14.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l6-6a1 1 0 0 0 0-1.414z"
      />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function NewMemberIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-3.5 w-3.5 shrink-0", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
      aria-hidden
    >
      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SSL Badge
// ─────────────────────────────────────────────────────────────────────────────

export interface SSLBadgeProps {
  /** Compact inline variant (for headers) vs pill variant (for footers) */
  variant?: "inline" | "pill";
  className?: string;
  /** Override certificate domain shown in the modal */
  domain?: string;
}

/**
 * Displays an SSL-secured badge with a click-to-open certificate details modal.
 *
 * @example
 * <SSLBadge variant="pill" />
 */
export function SSLBadge({ variant = "pill", className, domain = "agrolink.com.ng" }: SSLBadgeProps) {
  const [open, setOpen] = React.useState(false);
  const issued = new Date("2025-01-15").toLocaleDateString("en-GB", { dateStyle: "medium" });
  const expires = new Date("2026-01-15").toLocaleDateString("en-GB", { dateStyle: "medium" });

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="SSL Secured – click to view certificate details"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50",
        "px-3 py-1 text-xs font-medium text-green-700 transition-colors",
        "hover:bg-green-100 hover:border-green-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
        variant === "inline" && "px-2 py-0.5 text-[11px]",
        className
      )}
    >
      <LockIcon className="text-green-600" />
      SSL Secured
    </button>
  );

  return (
    <>
      <Tooltip content="256-bit SSL encryption protects your connection" placement="bottom">
        {trigger}
      </Tooltip>

      <Modal open={open} onClose={() => setOpen(false)} size="sm">
        <ModalHeader title="SSL Certificate Details" onClose={() => setOpen(false)} />
        <ModalBody>
          <div className="space-y-4">
            {/* Visual indicator */}
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <LockIcon className="h-5 w-5 text-green-600" />
              </span>
              <div>
                <p className="text-sm font-semibold text-green-800">Connection is Secure</p>
                <p className="text-xs text-green-700 mt-0.5">Your information is encrypted before being sent.</p>
              </div>
            </div>

            {/* Certificate table */}
            <dl className="divide-y divide-(--color-border) text-sm">
              {(
                [
                  ["Domain", domain],
                  ["Certificate Authority", "Let's Encrypt / Sectigo"],
                  ["Encryption", "TLS 1.3 / AES-256-GCM"],
                  ["Key Exchange", "ECDH (P-256)"],
                  ["Issued", issued],
                  ["Expires", expires],
                ] as [string, string][]
              ).map(([key, val]) => (
                <div key={key} className="flex justify-between gap-4 py-2">
                  <dt className="text-(--color-fg-muted) shrink-0">{key}</dt>
                  <dd className="text-(--color-fg) font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1"
          >
            Got it
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Payment Security Icons
// ─────────────────────────────────────────────────────────────────────────────

/** Simplified Visa wordmark badge */
function VisaLogo() {
  return (
    <span
      aria-label="Visa"
      role="img"
      className="inline-flex h-7 w-12 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-sm"
    >
      <svg viewBox="0 0 48 16" aria-hidden className="w-full">
        <text
          x="4"
          y="13"
          fontFamily="Arial, sans-serif"
          fontSize="13"
          fontWeight="bold"
          fontStyle="italic"
          fill="#1A1F71"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

/** Simplified Mastercard two-circle badge */
function MastercardLogo() {
  return (
    <span
      aria-label="Mastercard"
      role="img"
      className="inline-flex h-7 w-12 items-center justify-center rounded border border-slate-200 bg-white px-1 shadow-sm"
    >
      <svg viewBox="0 0 38 24" aria-hidden>
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="24" cy="12" r="10" fill="#F79E1B" />
        <path
          d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}

/** Simplified Verve wordmark badge */
function VerveLogo() {
  return (
    <span
      aria-label="Verve"
      role="img"
      className="inline-flex h-7 w-12 items-center justify-center rounded border border-slate-200 bg-white px-1.5 shadow-sm"
    >
      <svg viewBox="0 0 48 16" aria-hidden className="w-full">
        <text
          x="2"
          y="13"
          fontFamily="Arial, sans-serif"
          fontSize="11"
          fontWeight="bold"
          fill="#006E51"
          letterSpacing="0.3"
        >
          VERVE
        </text>
      </svg>
    </span>
  );
}

export interface PaymentSecurityIconsProps {
  className?: string;
  /** Show or hide the "Secure Payment" label */
  showLabel?: boolean;
  /** Layout direction */
  direction?: "row" | "col";
}

/**
 * Shows accepted payment methods with an encryption assurance tooltip.
 *
 * @example
 * <PaymentSecurityIcons />
 */
export function PaymentSecurityIcons({
  className,
  showLabel = true,
  direction = "row",
}: PaymentSecurityIconsProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-3",
        direction === "col" && "flex-col items-start",
        className
      )}
      aria-label="Accepted payment methods"
    >
      {showLabel && (
        <span className="text-xs font-medium text-(--color-fg-muted)">
          Secure Payment
        </span>
      )}

      {/* Card brand logos */}
      <div className="flex items-center gap-2" role="list" aria-label="Accepted cards">
        <div role="listitem"><VisaLogo /></div>
        <div role="listitem"><MastercardLogo /></div>
        <div role="listitem"><VerveLogo /></div>
      </div>

      {/* Encryption badge */}
      <Tooltip content="Your payment information is encrypted with 256-bit SSL" placement="top">
        <span
          tabIndex={0}
          role="img"
          aria-label="Payment encrypted with SSL"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50",
            "px-2.5 py-1 text-xs font-medium text-emerald-700 cursor-default",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
          )}
        >
          <ShieldLockIcon className="h-3.5 w-3.5 text-emerald-600" />
          Encrypted
        </span>
      </Tooltip>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Verification Badges
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationKind = "verified-farmer" | "verified-buyer" | "top-rated" | "new-member";

const verificationConfig: Record<
  VerificationKind,
  {
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    colorClasses: string;
    iconClass: string;
  }
> = {
  "verified-farmer": {
    label: "Verified Farmer",
    description: "Identity and farming activity have been verified by the Agrolink team.",
    icon: CheckCircleIcon,
    colorClasses: "border-green-200 bg-green-50 text-green-700",
    iconClass: "text-green-600",
  },
  "verified-buyer": {
    label: "Verified Buyer",
    description: "This buyer has been verified and has a positive transaction history.",
    icon: CheckCircleIcon,
    colorClasses: "border-blue-200 bg-blue-50 text-blue-700",
    iconClass: "text-blue-600",
  },
  "top-rated": {
    label: "Top Rated",
    description: "Consistently high ratings from the community over the past 6 months.",
    icon: StarIcon,
    colorClasses: "border-yellow-300 bg-yellow-50 text-yellow-700",
    iconClass: "text-yellow-500",
  },
  "new-member": {
    label: "New Member",
    description: "Recently joined Agrolink. Welcome them to the community!",
    icon: NewMemberIcon,
    colorClasses: "border-slate-200 bg-slate-50 text-slate-600",
    iconClass: "text-slate-500",
  },
};

export interface VerificationBadgeProps {
  kind: VerificationKind;
  /** Size of the badge */
  size?: "sm" | "md";
  /** Additional class names */
  className?: string;
  /** Tooltip placement */
  placement?: "top" | "bottom" | "left" | "right";
}

/**
 * Profile verification badge with hover tooltip showing verification details.
 *
 * @example
 * <VerificationBadge kind="verified-farmer" />
 * <VerificationBadge kind="top-rated" size="sm" />
 */
export function VerificationBadge({
  kind,
  size = "md",
  className,
  placement = "top",
}: VerificationBadgeProps) {
  const config = verificationConfig[kind];
  const Icon = config.icon;

  const badge = (
    <span
      role="img"
      aria-label={config.label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap cursor-default",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        config.colorClasses,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
      tabIndex={0}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", config.iconClass)} />
      {config.label}
    </span>
  );

  return (
    <Tooltip content={config.description} placement={placement}>
      {badge}
    </Tooltip>
  );
}

/**
 * Renders a stack of multiple verification badges for a profile.
 *
 * @example
 * <VerificationBadgeGroup kinds={["verified-farmer", "top-rated"]} />
 */
export interface VerificationBadgeGroupProps {
  kinds: VerificationKind[];
  size?: "sm" | "md";
  className?: string;
}

export function VerificationBadgeGroup({ kinds, size = "md", className }: VerificationBadgeGroupProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      aria-label="Verification badges"
    >
      {kinds.map((kind) => (
        <VerificationBadge key={kind} kind={kind} size={size} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Data Protection Notice
// ─────────────────────────────────────────────────────────────────────────────

export interface DataProtectionNoticeProps {
  /** Override the default message */
  message?: string;
  /** Override the privacy policy URL */
  privacyPolicyHref?: string;
  /** Position of the tooltip */
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Subtle, accessible data protection notice for use inside forms.
 * Shows an info icon with a tooltip and links to the privacy policy.
 *
 * @example
 * <DataProtectionNotice />
 * <DataProtectionNotice message="Your farm data is never sold to third parties." />
 */
export function DataProtectionNotice({
  message = "We protect your data",
  privacyPolicyHref = PRIVACY_POLICY_HREF,
  placement = "top",
  className,
}: DataProtectionNoticeProps) {
  const tooltipContent = (
    <span>
      Your information is encrypted and never shared without your consent.{" "}
      <a
        href={privacyPolicyHref}
        className="underline text-white/90 hover:text-white"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        Privacy Policy
      </a>
    </span>
  );

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 text-xs text-(--color-fg-muted)", className)}
    >
      <Tooltip content={tooltipContent} placement={placement}>
        <span
          tabIndex={0}
          aria-label="Data protection information"
          className="inline-flex items-center gap-1 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded"
        >
          <ShieldLockIcon className="h-3.5 w-3.5 text-(--color-fg-muted)" />
          <span>{message}</span>
        </span>
      </Tooltip>
      {" · "}
      <a
        href={privacyPolicyHref}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-(--color-fg) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded"
        aria-label="Read our privacy policy (opens in new tab)"
      >
        Privacy Policy
      </a>
    </div>
  );
}
