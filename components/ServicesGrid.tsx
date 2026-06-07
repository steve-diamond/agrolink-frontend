"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  BanknotesIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceColor = "green" | "orange" | "teal" | "blue";

export interface ServiceConfig {
  /** Stable unique ID */
  id: string;
  /** Service name — rendered as an h3 */
  name: string;
  /** Two-sentence description of the service */
  description: string;
  /** Short benefit phrases shown as pills */
  tags: string[];
  /** Internal link for "Learn More" */
  href: string;
  /** Icon render function — receives a className for sizing/color */
  icon: (className: string) => React.ReactNode;
  /** Accent colour theme for the card */
  color: ServiceColor;
}

// ─── Default service data ─────────────────────────────────────────────────────

export const DEFAULT_SERVICES: ServiceConfig[] = [
  {
    id: "agri-loans",
    name: "Agri Loans",
    description:
      "Access flexible, collateral-light financing designed for smallholder farmers and cooperatives. Get funds disbursed within 48 hours of approval directly to your DosAgrolink wallet.",
    tags: ["Fast 48-hr disbursement", "Transparent repayment", "No hidden fees"],
    href: "/loan-application",
    color: "green",
    icon: (cls) => <BanknotesIcon className={cls} aria-hidden />,
  },
  {
    id: "logistics",
    name: "Logistics Support",
    description:
      "Book refrigerated trucks, motorcycle couriers, or bulk haulage from your farm gate to any buyer across Nigeria. Real-time GPS tracking keeps you informed at every stage.",
    tags: ["Farm-gate pickup", "GPS tracking", "Cold-chain options"],
    href: "/logistics",
    color: "orange",
    icon: (cls) => <TruckIcon className={cls} aria-hidden />,
  },
  {
    id: "warehousing",
    name: "Warehousing",
    description:
      "Store your harvest in certified, climate-controlled warehouses and release inventory when market prices peak. Warehouse receipts can be used as collateral for our Agri Loans.",
    tags: ["Climate-controlled", "Receipt financing", "34 locations"],
    href: "/warehouse",
    color: "teal",
    icon: (cls) => <BuildingStorefrontIcon className={cls} aria-hidden />,
  },
  {
    id: "insurance",
    name: "Crop Insurance",
    description:
      "Protect your farm against drought, flooding, and pest damage with index-based insurance underwritten by licensed Nigerian insurers. Claims are processed within 5 business days.",
    tags: ["Index-based payouts", "5-day claims", "Covers 12 crop types"],
    href: "/insurance",
    color: "blue",
    icon: (cls) => <ShieldCheckIcon className={cls} aria-hidden />,
  },
];

// ─── Color maps ───────────────────────────────────────────────────────────────

const colorMap: Record<
  ServiceColor,
  {
    iconBg: string;
    iconText: string;
    topAccent: string;
    hoverBorder: string;
    hoverGlow: string;
    hoverIconBg: string;
    tagBg: string;
    tagText: string;
    linkText: string;
    linkHover: string;
  }
> = {
  green: {
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    topAccent: "bg-linear-to-r from-emerald-600 to-teal-500",
    hoverBorder: "hover:border-emerald-500/40",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.20)]",
    hoverIconBg: "group-hover:bg-emerald-500/25",
    tagBg: "bg-emerald-500/10",
    tagText: "text-emerald-400",
    linkText: "text-emerald-400",
    linkHover: "hover:text-emerald-300",
  },
  orange: {
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-400",
    topAccent: "bg-linear-to-r from-orange-600 to-amber-500",
    hoverBorder: "hover:border-orange-500/40",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-8px_rgba(249,115,22,0.20)]",
    hoverIconBg: "group-hover:bg-orange-500/25",
    tagBg: "bg-orange-500/10",
    tagText: "text-orange-400",
    linkText: "text-orange-400",
    linkHover: "hover:text-orange-300",
  },
  teal: {
    iconBg: "bg-teal-500/15",
    iconText: "text-teal-400",
    topAccent: "bg-linear-to-r from-teal-600 to-cyan-500",
    hoverBorder: "hover:border-teal-500/40",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-8px_rgba(20,184,166,0.20)]",
    hoverIconBg: "group-hover:bg-teal-500/25",
    tagBg: "bg-teal-500/10",
    tagText: "text-teal-400",
    linkText: "text-teal-400",
    linkHover: "hover:text-teal-300",
  },
  blue: {
    iconBg: "bg-sky-500/15",
    iconText: "text-sky-400",
    topAccent: "bg-linear-to-r from-sky-600 to-blue-500",
    hoverBorder: "hover:border-sky-500/40",
    hoverGlow:
      "hover:shadow-[0_12px_40px_-8px_rgba(14,165,233,0.20)]",
    hoverIconBg: "group-hover:bg-sky-500/25",
    tagBg: "bg-sky-500/10",
    tagText: "text-sky-400",
    linkText: "text-sky-400",
    linkHover: "hover:text-sky-300",
  },
};

// ─── Animation helpers ───────────────────────────────────────────────────────

/** Per-card stagger: index × 100 ms offset, 500 ms duration */
function cardTransition(index: number, reduced: boolean) {
  if (reduced) return { duration: 0 };
  return {
    duration: 0.5,
    delay: index * 0.1,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceConfig;
  index: number;
  inView: boolean;
  prefersReducedMotion: boolean;
}

function ServiceCard({ service, index, inView, prefersReducedMotion }: ServiceCardProps) {
  const c = colorMap[service.color];

  return (
    <motion.li
      className="flex w-full"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : prefersReducedMotion
          ? undefined
          : { opacity: 0, y: 28, scale: 0.97 }
      }
      transition={cardTransition(index, prefersReducedMotion)}
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.015 }}
    >
    <article
      className={cn(
        "group relative flex flex-col w-full rounded-2xl overflow-hidden",
        "bg-white/5 backdrop-blur-sm",
        "border border-white/10 transition-all duration-300",
        "shadow-lg shadow-black/20",
        c.hoverBorder,
        c.hoverGlow,
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-950"
      )}
      aria-labelledby={`service-${service.id}-heading`}
    >
      {/* Coloured top accent bar */}
      <div className={cn("h-1 w-full shrink-0", c.topAccent)} aria-hidden />

      {/* Card body */}
      <div className="flex flex-col flex-1 gap-5 p-6 sm:p-7">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center size-14 rounded-xl",
            "transition-colors duration-300",
            c.iconBg,
            c.hoverIconBg
          )}
          aria-hidden
        >
          {service.icon(cn("size-7", c.iconText))}
        </div>

        {/* Name + description */}
        <div className="space-y-2">
          <h3
            id={`service-${service.id}-heading`}
            className="text-lg sm:text-xl font-bold text-white leading-snug"
          >
            {service.name}
          </h3>
          <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Benefit tags */}
        {service.tags.length > 0 && (
          <ul
            className="flex flex-wrap gap-2"
            aria-label={`Key benefits of ${service.name}`}
          >
            {service.tags.map((tag) => (
              <li
                key={tag}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
                  "text-[11px] font-medium tracking-wide",
                  "border border-white/8",
                  c.tagBg,
                  c.tagText
                )}
              >
                <CheckCircleIcon className="size-3 shrink-0 opacity-80" aria-hidden />
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/* Spacer — pushes CTA to the bottom */}
        <div className="flex-1" aria-hidden />

        {/* Divider */}
        <div className="h-px bg-white/8" aria-hidden />

        {/* "Learn More" CTA */}
        <Link
          href={service.href}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold",
            "transition-colors duration-200",
            c.linkText,
            c.linkHover,
            "group/link",
            "focus-visible:outline-none"
          )}
          aria-label={`Learn more about ${service.name}`}
        >
          Learn More
          <ArrowRightIcon
            className="size-4 transition-transform duration-200 group-hover/link:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>

      {/* Hover ambient glow — blurred sibling element */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "transition-opacity duration-500 blur-xl -z-10",
          service.color === "green" && "bg-emerald-500/12",
          service.color === "orange" && "bg-orange-500/12",
          service.color === "teal" && "bg-teal-500/12",
          service.color === "blue" && "bg-sky-500/12"
        )}
        aria-hidden
      />
    </article>
    </motion.li>
  );
}

// ─── ServicesGrid ─────────────────────────────────────────────────────────────

export interface ServicesGridProps {
  /** Override default service definitions */
  services?: ServiceConfig[];
  /** Section heading */
  heading?: string;
  /** Section subheading */
  subheading?: string;
  /** Additional className on the section element */
  className?: string;
  /** Intersection Observer threshold — default 0.1 */
  threshold?: number;
}

export function ServicesGrid({
  services = DEFAULT_SERVICES,
  heading = "Everything Your Farm Needs",
  subheading =
    "From financing to last-mile delivery — DosAgrolink bundles the full agricultural value chain into one platform.",
  className,
  threshold = 0.1,
}: ServicesGridProps) {
  // Honour prefers-reduced-motion via a simple media query check
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const { ref, inView } = useInView({ threshold, triggerOnce: true });

  return (
    <section
      ref={ref}
      aria-labelledby="services-heading"
      className={cn(
        "relative isolate overflow-hidden py-20 sm:py-28",
        "bg-linear-to-b from-gray-950 via-gray-900 to-gray-950",
        className
      )}
    >
      {/* Top rule */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/25 to-transparent"
        aria-hidden
      />

      {/* Subtle grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.025] pointer-events-none"
        aria-hidden
      >
        <defs>
          <pattern
            id="services-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#services-grid)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Heading ── */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center space-y-4"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-emerald-400">
            <span
              className="block size-1.5 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden
            />
            Platform Services
          </p>

          <h2
            id="services-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
          >
            {heading}
          </h2>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
            {subheading}
          </p>
        </motion.div>

        {/* ── Cards grid ── */}
        <ul
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 list-none p-0 m-0"
          aria-label="Platform services"
        >
          {services.map((service, idx) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={idx}
              inView={inView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </ul>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={
            inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
          }
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            All services are available to registered DosAgrolink members.{" "}
            <Link
              href="/join-us"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              Create your free account →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesGrid;
