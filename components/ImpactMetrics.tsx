"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetricConfig {
  /** Unique key for the metric */
  id: string;
  /** Display label shown below the number */
  label: string;
  /** Aria-label for screen readers (full descriptive text) */
  ariaLabel: string;
  /** Numeric target value to count up to */
  value: number;
  /** Suffix appended after the formatted number, e.g. "+" or "%" */
  suffix?: string;
  /** Prefix prepended before the formatted number, e.g. "₦" */
  prefix?: string;
  /** Display value override — when set, skip counter and show this string directly */
  displayOverride?: string;
  /** Compact display format: abbreviate large numbers (2500000000 → "2.5B") */
  compact?: boolean;
  /** Description line below the label */
  description?: string;
  /** Icon render function — receives className for sizing/colour */
  icon: (className: string) => React.ReactNode;
  /** Tailwind gradient classes for the number text */
  gradient: string;
  /** Tailwind ring/border-top accent colour for the card */
  accentColor: string;
  /** Background glow colour (Tailwind arbitrary class, e.g. "bg-emerald-500/8") */
  glowColor: string;
}

// ─── Easing ───────────────────────────────────────────────────────────────────

/** Cubic ease-out — fast start, smooth deceleration */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Elastic ease-out — overshoots slightly at the end */
function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// ─── Compact number formatter ─────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-NG");
}

function formatFull(n: number): string {
  return Math.round(n).toLocaleString("en-NG");
}

// ─── useAnimatedCounter hook ──────────────────────────────────────────────────

interface UseAnimatedCounterOptions {
  target: number;
  duration?: number;
  enabled: boolean;
  easing?: (t: number) => number;
}

function useAnimatedCounter({
  target,
  duration = 2000,
  enabled,
  easing = easeOutCubic,
}: UseAnimatedCounterOptions): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasRunRef = useRef(false);

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    },
    [target, duration, easing]
  );

  useEffect(() => {
    if (!enabled || hasRunRef.current) return;
    hasRunRef.current = true;
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, animate]);

  // Reset when target changes (e.g. data refresh)
  useEffect(() => {
    hasRunRef.current = false;
    setValue(0);
  }, [target]);

  return value;
}

// ─── Default metrics data ─────────────────────────────────────────────────────

const DEFAULT_METRICS: MetricConfig[] = [
  {
    id: "farmers",
    label: "Active Farmers",
    ariaLabel: "50,000 or more active farmers on the platform",
    value: 50_000,
    suffix: "+",
    compact: false,
    description: "Verified smallholders & cooperatives",
    gradient: "from-emerald-400 to-teal-300",
    accentColor: "border-t-emerald-500",
    glowColor: "emerald",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v2.25m0 0v2.25m0-2.25h2.25m-2.25 0H9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "volume",
    label: "Trade Volume",
    ariaLabel: "Over 2.5 billion naira in trade volume processed",
    value: 2_500_000_000,
    prefix: "₦",
    suffix: "+",
    compact: true,
    description: "Naira traded through the platform",
    gradient: "from-orange-400 to-amber-300",
    accentColor: "border-t-orange-500",
    glowColor: "orange",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    ariaLabel: "150,000 or more successful transactions completed",
    value: 150_000,
    suffix: "+",
    compact: false,
    description: "Verified successful trades",
    gradient: "from-sky-400 to-blue-300",
    accentColor: "border-t-sky-500",
    glowColor: "sky",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    id: "states",
    label: "States Covered",
    ariaLabel: "35 out of 36 Nigerian states covered",
    value: 35,
    displayOverride: "35/36",
    description: "Nationwide agricultural reach",
    gradient: "from-violet-400 to-purple-300",
    accentColor: "border-t-violet-500",
    glowColor: "violet",
    icon: (cls) => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
];

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  metric: MetricConfig;
  /** Whether the section has entered the viewport */
  inView: boolean;
  /** Index used for stagger delay */
  index: number;
  prefersReducedMotion: boolean;
}

function MetricCard({ metric, inView, index, prefersReducedMotion }: MetricCardProps) {
  const shouldAnimate = inView && !prefersReducedMotion;

  // Primary counter (elastic easing for a punchy finish)
  const counterValue = useAnimatedCounter({
    target: metric.value,
    duration: 1800 + index * 120,
    enabled: shouldAnimate || (inView && prefersReducedMotion),
    easing: prefersReducedMotion ? easeOutCubic : easeOutElastic,
  });

  const displayValue = metric.displayOverride
    ? metric.displayOverride
    : metric.compact
    ? formatCompact(shouldAnimate || inView ? counterValue : 0)
    : formatFull(shouldAnimate || inView ? counterValue : 0);

  // Card entrance animation
  const cardVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const glowMap: Record<string, string> = {
    emerald: "group-hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.25)]",
    orange: "group-hover:shadow-[0_8px_32px_-4px_rgba(249,115,22,0.25)]",
    sky: "group-hover:shadow-[0_8px_32px_-4px_rgba(14,165,233,0.25)]",
    violet: "group-hover:shadow-[0_8px_32px_-4px_rgba(139,92,246,0.25)]",
  };

  const iconBgMap: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25",
    orange: "bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25",
    sky: "bg-sky-500/15 text-sky-400 group-hover:bg-sky-500/25",
    violet: "bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25",
  };

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : cardVariants}
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={inView ? "visible" : "hidden"}
      className="group relative"
    >
      {/* Ambient glow layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10",
          metric.glowColor === "emerald" && "bg-emerald-500/20",
          metric.glowColor === "orange" && "bg-orange-500/20",
          metric.glowColor === "sky" && "bg-sky-500/20",
          metric.glowColor === "violet" && "bg-violet-500/20"
        )}
        aria-hidden
      />

      {/* Card */}
      <div
        className={cn(
          "relative flex flex-col items-center text-center gap-4 px-6 py-8 rounded-2xl",
          "bg-white/5 backdrop-blur-sm",
          "border border-white/8 border-t-2",
          metric.accentColor,
          "transition-all duration-300 ease-out",
          "group-hover:-translate-y-1.5 group-hover:bg-white/8 group-hover:border-white/15",
          glowMap[metric.glowColor] ?? "",
          "shadow-lg shadow-black/20"
        )}
        role="figure"
        aria-label={metric.ariaLabel}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center size-14 rounded-xl transition-all duration-300",
            iconBgMap[metric.glowColor] ?? "bg-white/10 text-white"
          )}
          aria-hidden
        >
          {metric.icon("size-7")}
        </div>

        {/* Number */}
        <div className="space-y-1" aria-live="polite" aria-atomic="true">
          <p
            className={cn(
              "font-black tracking-tight bg-linear-to-br bg-clip-text text-transparent",
              "text-5xl sm:text-6xl",
              metric.gradient
            )}
          >
            {metric.prefix && (
              <span className="text-3xl sm:text-4xl align-top mt-1.5 inline-block mr-0.5 font-bold">
                {metric.prefix}
              </span>
            )}
            {displayValue}
            {metric.suffix && !metric.displayOverride && (
              <span className="text-4xl sm:text-5xl">{metric.suffix}</span>
            )}
          </p>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <p className="text-base sm:text-lg font-semibold text-white tracking-wide">
            {metric.label}
          </p>
          {metric.description && (
            <p className="text-xs sm:text-sm text-gray-400 leading-snug max-w-[14rem] mx-auto">
              {metric.description}
            </p>
          )}
        </div>

        {/* Subtle shimmer line at top */}
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-60",
            metric.glowColor === "emerald" && "bg-linear-to-r from-transparent via-emerald-500 to-transparent",
            metric.glowColor === "orange" && "bg-linear-to-r from-transparent via-orange-500 to-transparent",
            metric.glowColor === "sky" && "bg-linear-to-r from-transparent via-sky-500 to-transparent",
            metric.glowColor === "violet" && "bg-linear-to-r from-transparent via-violet-500 to-transparent"
          )}
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

// ─── Decorative background dots ───────────────────────────────────────────────

function GridDots() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.03] pointer-events-none"
      aria-hidden
    >
      <defs>
        <pattern id="impact-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" className="text-white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#impact-grid)" />
    </svg>
  );
}

// ─── ImpactMetrics ────────────────────────────────────────────────────────────

export interface ImpactMetricsProps {
  /** Override default metrics */
  metrics?: MetricConfig[];
  /** Section heading */
  heading?: string;
  /** Section subheading */
  subheading?: string;
  /** Additional className on the section wrapper */
  className?: string;
  /** Intersection Observer threshold — default 0.2 */
  threshold?: number;
}

export function ImpactMetrics({
  metrics = DEFAULT_METRICS,
  heading = "Our Impact in Numbers",
  subheading = "DosAgrolink is transforming Nigerian agriculture — connecting farmers, buyers, and investors at scale.",
  className,
  threshold = 0.2,
}: ImpactMetricsProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  const subheadingVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <section
      ref={ref}
      aria-labelledby="impact-metrics-heading"
      className={cn(
        "relative isolate overflow-hidden py-20 sm:py-28",
        "bg-linear-to-b from-gray-950 via-gray-900 to-gray-950",
        className
      )}
    >
      {/* Background decoration */}
      <GridDots />

      {/* Radial highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.04] blur-3xl bg-emerald-400 pointer-events-none"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-14 text-center space-y-4">
          <motion.div
            variants={prefersReducedMotion ? undefined : headingVariants}
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={inView ? "visible" : "hidden"}
          >
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2 mb-3 text-xs font-semibold tracking-widest uppercase text-emerald-400">
              <span
                className="block size-1.5 rounded-full bg-emerald-400 animate-pulse"
                aria-hidden
              />
              Platform Achievements
            </p>

            <h2
              id="impact-metrics-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
            >
              {heading}
            </h2>
          </motion.div>

          <motion.p
            variants={prefersReducedMotion ? undefined : subheadingVariants}
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={inView ? "visible" : "hidden"}
            className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed"
          >
            {subheading}
          </motion.p>
        </div>

        {/* Metrics grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          role="list"
          aria-label="Platform impact statistics"
        >
          {metrics.map((metric, idx) => (
            <div key={metric.id} role="listitem">
              <MetricCard
                metric={metric}
                inView={inView}
                index={idx}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          variants={
            prefersReducedMotion
              ? undefined
              : {
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: 0.6 },
                  },
                }
          }
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={inView ? "visible" : "hidden"}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            Numbers updated in real-time.{" "}
            <a
              href="/about-us"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              Learn about our mission
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ImpactMetrics;
