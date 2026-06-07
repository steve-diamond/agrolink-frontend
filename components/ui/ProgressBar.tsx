"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

// ── Shared types ──────────────────────────────────────────────────────────────

type ProgressVariant = "primary" | "success" | "warning" | "error" | "info";
type ProgressSize   = "xs" | "sm" | "md" | "lg";

const barColors: Record<ProgressVariant, string> = {
  primary: "bg-primary-600",
  success: "bg-success",
  warning: "bg-warning",
  error:   "bg-error",
  info:    "bg-accent-500",
};

const trackColors: Record<ProgressVariant, string> = {
  primary: "bg-primary-100",
  success: "bg-green-100",
  warning: "bg-yellow-100",
  error:   "bg-red-100",
  info:    "bg-cyan-100",
};

const strokeColors: Record<ProgressVariant, string> = {
  primary: "stroke-primary-600",
  success: "stroke-success",
  warning: "stroke-warning",
  error:   "stroke-error",
  info:    "stroke-accent-500",
};

// ── Linear Progress ───────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** 0–100; omit or set to undefined for indeterminate/shimmer */
  value?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  /** Show percentage label above the bar */
  showLabel?: boolean;
  /** Custom label content */
  label?: string;
  /** Animate on first mount */
  animated?: boolean;
  className?: string;
}

const trackHeights: Record<ProgressSize, string> = {
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

/**
 * Horizontal progress bar. Pass `value` (0-100) for a determinate bar,
 * or omit it for an animated indeterminate shimmer.
 *
 * @example
 * <ProgressBar value={72} variant="success" size="md" showLabel />
 * <ProgressBar variant="primary" />  // indeterminate
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = "primary",
  size = "md",
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const indeterminate = value === undefined || value === null;
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && !indeterminate && (
        <div className="flex justify-between mb-1 text-xs font-medium text-[var(--color-fg-muted)]">
          <span>{label ?? "Progress"}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full rounded-full overflow-hidden",
          trackHeights[size],
          trackColors[variant]
        )}
      >
        {indeterminate ? (
          /* Shimmer / indeterminate */
          <div
            className={cn(
              "h-full w-1/3 rounded-full",
              barColors[variant],
              "animate-[shimmer_1.4s_ease-in-out_infinite]",
              "[background:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] bg-no-repeat"
            )}
            style={{ animation: "progressSlide 1.4s ease-in-out infinite" }}
          />
        ) : (
          <motion.div
            className={cn("h-full rounded-full", barColors[variant])}
            initial={{ width: animated ? "0%" : `${clamped}%` }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </div>
    </div>
  );
};

// ── Circular Progress ─────────────────────────────────────────────────────────

export interface CircularProgressProps {
  /** 0–100 */
  value?: number;
  variant?: ProgressVariant;
  /** Diameter in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * SVG circular progress ring. Pass `value` (0-100) or omit for indeterminate rotation.
 *
 * @example
 * <CircularProgress value={65} variant="primary" size={80} showLabel />
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  variant = "primary",
  size = 64,
  strokeWidth = 6,
  showLabel = false,
  label,
  className,
}) => {
  const indeterminate = value === undefined || value === null;
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <svg width={size} height={size} className={cn(indeterminate && "animate-spin")} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
        />
        {/* Filled arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={strokeColors[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: indeterminate ? circumference * 0.75 : offset }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span className="absolute text-xs font-semibold text-[var(--color-fg)]">
          {clamped}%
        </span>
      )}
    </div>
  );
};

// ── Indeterminate keyframes (global inject once) ──────────────────────────────
// Tailwind's @keyframes shimmer is already in tailwind.config.js,
// but we add the slide animation for the indeterminate bar via a style tag.

if (typeof document !== "undefined") {
  const styleId = "__progress-bar-keyframes__";
  if (!document.getElementById(styleId)) {
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = `
      @keyframes progressSlide {
        0%   { transform: translateX(-100%); }
        60%  { transform: translateX(300%); }
        100% { transform: translateX(300%); }
      }
    `;
    document.head.appendChild(s);
  }
}
