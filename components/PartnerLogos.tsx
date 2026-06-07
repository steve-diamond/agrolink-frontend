"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ArrowRightIcon,
  PlusCircleIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { cn } from "@/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PartnerCategory =
  | "bank"
  | "logistics"
  | "government"
  | "ngo"
  | "cooperative";

export interface PartnerConfig {
  /** Stable unique ID */
  id: string;
  /** Full organisation name — used for alt text and display */
  name: string;
  /** Logo image URL or root-relative path, e.g. /images/partners/name.png */
  logo: string;
  /** Organisation category — used for accessible labelling */
  category: PartnerCategory;
  /** Optional link to the partner's website (external) */
  url?: string;
}

// ─── Seed partner data ────────────────────────────────────────────────────────

export const DEFAULT_PARTNERS: PartnerConfig[] = [
  // Banks & financial institutions
  {
    id: "firstbank",
    name: "First Bank Nigeria",
    logo: "/images/partners/firstbank.png",
    category: "bank",
    url: "https://www.firstbanknigeria.com",
  },
  {
    id: "zenith",
    name: "Zenith Bank",
    logo: "/images/partners/zenith.png",
    category: "bank",
    url: "https://www.zenithbank.com",
  },
  {
    id: "access",
    name: "Access Bank",
    logo: "/images/partners/access.png",
    category: "bank",
    url: "https://www.accessbankplc.com",
  },
  {
    id: "uba",
    name: "United Bank for Africa",
    logo: "/images/partners/uba.png",
    category: "bank",
    url: "https://www.ubagroup.com",
  },
  // Government agencies
  {
    id: "fmard",
    name: "Federal Ministry of Agriculture",
    logo: "/images/partners/fmard.png",
    category: "government",
  },
  {
    id: "cbn",
    name: "Central Bank of Nigeria",
    logo: "/images/partners/cbn.png",
    category: "government",
    url: "https://www.cbn.gov.ng",
  },
  {
    id: "nafdac",
    name: "NAFDAC",
    logo: "/images/partners/nafdac.png",
    category: "government",
    url: "https://www.nafdac.gov.ng",
  },
  // NGOs & development partners
  {
    id: "usaid",
    name: "USAID Nigeria",
    logo: "/images/partners/usaid.png",
    category: "ngo",
    url: "https://www.usaid.gov/nigeria",
  },
  {
    id: "ifad",
    name: "IFAD",
    logo: "/images/partners/ifad.png",
    category: "ngo",
    url: "https://www.ifad.org",
  },
  {
    id: "heifer",
    name: "Heifer International",
    logo: "/images/partners/heifer.png",
    category: "ngo",
    url: "https://www.heifer.org",
  },
  // Logistics
  {
    id: "kobo360",
    name: "Kobo360",
    logo: "/images/partners/kobo360.png",
    category: "logistics",
    url: "https://kobo360.com",
  },
  // Cooperative / commodity exchange
  {
    id: "afex",
    name: "AFEX Commodities Exchange",
    logo: "/images/partners/afex.png",
    category: "cooperative",
    url: "https://afexnigeria.com",
  },
];

// ─── Category labels (for ARIA) ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<PartnerCategory, string> = {
  bank: "Financial institution",
  logistics: "Logistics partner",
  government: "Government agency",
  ngo: "NGO / development partner",
  cooperative: "Cooperative / commodity exchange",
};

// ─── Animation helpers ────────────────────────────────────────────────────────

function itemTransition(index: number, reduced: boolean) {
  if (reduced) return { duration: 0 };
  return {
    duration: 0.4,
    delay: index * 0.045,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };
}

// ─── PartnerCard ──────────────────────────────────────────────────────────────

interface PartnerCardProps {
  partner: PartnerConfig;
  index: number;
  inView: boolean;
  prefersReducedMotion: boolean;
}

function PartnerCard({
  partner,
  index,
  inView,
  prefersReducedMotion,
}: PartnerCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryLabel = CATEGORY_LABELS[partner.category];

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.93, y: 10 }
      }
      animate={
        inView
          ? { opacity: 1, scale: 1, y: 0 }
          : prefersReducedMotion
          ? undefined
          : { opacity: 0, scale: 0.93, y: 10 }
      }
      transition={itemTransition(index, prefersReducedMotion)}
      whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.05 }}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3",
        "aspect-3/2 rounded-xl p-4 sm:p-5",
        "bg-white/5 border border-white/8 backdrop-blur-sm",
        "shadow-md shadow-black/20",
        "transition-[border-color,box-shadow,background-color] duration-300",
        "hover:border-emerald-500/30 hover:bg-white/8",
        "hover:shadow-[0_8px_28px_-6px_rgba(16,185,129,0.18)]",
        "focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-950"
      )}
      role="figure"
      aria-label={`${partner.name} — ${categoryLabel}`}
    >
      {/* Logo image */}
      <div className="flex items-center justify-center h-10 w-full">
        {!imgError ? (
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            draggable={false}
            className={cn(
              "max-h-9 max-w-[75%] w-auto h-auto object-contain",
              "grayscale opacity-55",
              "transition-[filter,opacity] duration-300 ease-out",
              "group-hover:grayscale-0 group-hover:opacity-100"
            )}
          />
        ) : (
          /* Initials/icon fallback when image fails to load */
          <div className="flex items-center justify-center size-10 rounded-lg bg-white/8 shrink-0">
            <BuildingOffice2Icon
              className="size-5 text-gray-500 group-hover:text-emerald-400 transition-colors duration-300"
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Partner name */}
      <p
        className={cn(
          "text-[10px] sm:text-[11px] font-medium text-center leading-tight",
          "text-gray-500 transition-colors duration-300",
          "group-hover:text-gray-200",
          "line-clamp-2 px-1"
        )}
      >
        {partner.name}
      </p>

      {/* Stretched link — covers the entire card when URL is provided */}
      {partner.url && (
        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 rounded-xl focus-visible:outline-none"
          aria-label={`Visit ${partner.name} website (opens in new tab)`}
        />
      )}
    </motion.div>
  );
}

// ─── BecomePartnerCard ────────────────────────────────────────────────────────

interface BecomePartnerCardProps {
  index: number;
  inView: boolean;
  prefersReducedMotion: boolean;
}

function BecomePartnerCard({
  index,
  inView,
  prefersReducedMotion,
}: BecomePartnerCardProps) {
  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.93, y: 10 }
      }
      animate={
        inView
          ? { opacity: 1, scale: 1, y: 0 }
          : prefersReducedMotion
          ? undefined
          : { opacity: 0, scale: 0.93, y: 10 }
      }
      transition={itemTransition(index, prefersReducedMotion)}
      whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.05 }}
      className="aspect-3/2"
    >
      <Link
        href="/join-us"
        className={cn(
          "group flex flex-col items-center justify-center gap-2.5",
          "h-full w-full rounded-xl p-4 sm:p-5",
          "border border-dashed border-emerald-500/30 bg-emerald-500/5",
          "transition-all duration-300",
          "hover:border-emerald-500/55 hover:bg-emerald-500/10",
          "hover:shadow-[0_8px_28px_-6px_rgba(16,185,129,0.22)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
        )}
        aria-label="Become a DosAgrolink partner — learn more"
      >
        {/* Plus icon */}
        <PlusCircleIcon
          className="size-8 text-emerald-500/40 group-hover:text-emerald-400 transition-colors duration-300"
          aria-hidden
        />

        {/* Text */}
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold text-emerald-400 leading-tight">
            Become a Partner
          </p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors duration-300 leading-tight">
            Join our growing network
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-1 text-emerald-500/60 group-hover:text-emerald-400 transition-all duration-300 group-hover:gap-1.5">
          <span className="text-[10px] font-medium">Learn more</span>
          <ArrowRightIcon
            className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Category filter pills ────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: PartnerCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bank", label: "Banks" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGOs" },
  { value: "logistics", label: "Logistics" },
  { value: "cooperative", label: "Cooperatives" },
];

// ─── PartnerLogos ─────────────────────────────────────────────────────────────

export interface PartnerLogosProps {
  /** Override the seed partners list */
  partners?: PartnerConfig[];
  /** Show category filter pills above the grid */
  showFilter?: boolean;
  /** Section heading */
  heading?: string;
  /** Section subheading */
  subheading?: string;
  /** Additional className on the section element */
  className?: string;
  /** Intersection Observer threshold — default 0.1 */
  threshold?: number;
}

export function PartnerLogos({
  partners = DEFAULT_PARTNERS,
  showFilter = true,
  heading = "Trusted by Leading Organizations",
  subheading =
    "DosAgrolink works alongside banks, government agencies, NGOs, and logistics providers to deliver a complete agricultural ecosystem.",
  className,
  threshold = 0.1,
}: PartnerLogosProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeFilter, setActiveFilter] = useState<PartnerCategory | "all">(
    "all"
  );

  const { ref, inView } = useInView({ threshold, triggerOnce: true });

  const filtered =
    activeFilter === "all"
      ? partners
      : partners.filter((p) => p.category === activeFilter);

  return (
    <section
      ref={ref}
      aria-labelledby="partners-heading"
      className={cn(
        "relative isolate overflow-hidden py-20 sm:py-28",
        "bg-linear-to-b from-gray-900 to-gray-950",
        className
      )}
    >
      {/* Decorative rules */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/6 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Heading ── */}
        <motion.div
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 18 }
          }
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
          className="mb-10 text-center space-y-3"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400">
            <span
              className="block h-px w-6 bg-gray-500"
              aria-hidden
            />
            Our Partners
            <span
              className="block h-px w-6 bg-gray-500"
              aria-hidden
            />
          </p>

          <h2
            id="partners-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight"
          >
            {heading}
          </h2>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-gray-400 leading-relaxed">
            {subheading}
          </p>
        </motion.div>

        {/* ── Category filter ── */}
        {showFilter && (
          <motion.div
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 10 }
            }
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }
            }
            className="mb-8 flex flex-wrap items-center justify-center gap-2"
            role="group"
            aria-label="Filter partners by category"
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActiveFilter(opt.value)}
                aria-pressed={activeFilter === opt.value ? "true" : "false"}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  activeFilter === opt.value
                    ? "bg-emerald-500 text-white shadow shadow-emerald-900/40"
                    : "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-white border border-white/8"
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Logo grid ── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          role="list"
          aria-label="Partner organisations"
        >
          {filtered.map((partner, idx) => (
            <div key={partner.id} role="listitem">
              <PartnerCard
                partner={partner}
                index={idx}
                inView={inView}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          ))}

          {/* CTA card — always at the end */}
          <div role="listitem">
            <BecomePartnerCard
              index={filtered.length}
              inView={inView}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.5, delay: 0.7 }
          }
          className="mt-10 text-center text-xs text-gray-600"
        >
          All logos are property of their respective organisations and are used
          with permission.
        </motion.p>
      </div>
    </section>
  );
}

export default PartnerLogos;
