"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./ui/utils";

const EASE_STANDARD: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Activity feed data ────────────────────────────────────────────────────────

const FEED_ITEMS = [
  "🌾 John Emeka just sold 20 bags of maize in Kano",
  "🥬 Amara Bello listed 500 kg of tomatoes in Lagos",
  "💳 David Obi received a ₦150,000 agri-loan in Kaduna",
  "🚚 Halima Musa's delivery of 10 bags of rice is en route to Abuja",
  "📦 FreshFoods Ltd. just placed a ₦480,000 purchase order",
  "🌽 Chukwudi Farms listed 2 tonnes of sweet corn in Anambra",
  "💼 CapVest Fund invested ₦5M in 3 verified farms today",
  "🏠 Warehouse storage booked in Port Harcourt – 800 kg secured",
];

// ── Trust indicators ──────────────────────────────────────────────────────────

const TRUST = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    label: "SSL Secured",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
    ),
    label: "150K+ Transactions",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.077 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.077-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
    label: "₦2.5B+ in Trade Volume",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
    label: "50,000+ Farmers",
  },
];

// ── User-type cards ───────────────────────────────────────────────────────────

const USER_CARDS = [
  {
    emoji: "🌾",
    title: "Farmers",
    description: "Sell your produce, access loans, and connect to verified buyers across Nigeria.",
    cta: "Start Selling",
    href: "/farmer",
    accent: "#16A34A",
    accentLight: "rgba(22,163,74,0.12)",
    ring: "ring-primary-500",
    ctaClass: "bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500",
  },
  {
    emoji: "🏢",
    title: "Buyers",
    description: "Source quality graded produce directly from trusted farms at competitive prices.",
    cta: "Browse Produce",
    href: "/marketplace",
    accent: "#EA580C",
    accentLight: "rgba(234,88,12,0.12)",
    ring: "ring-orange-500",
    ctaClass: "bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500",
  },
  {
    emoji: "💼",
    title: "Investors",
    description: "Fund verified agricultural projects and earn returns while driving food security.",
    cta: "Explore Deals",
    href: "/invest",
    accent: "#0891B2",
    accentLight: "rgba(8,145,178,0.12)",
    ring: "ring-cyan-500",
    ctaClass: "bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500",
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE_STANDARD, delay },
});

const fadeDown = (delay = 0) => ({
  initial: { opacity: 0, y: -20 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE_STANDARD, delay },
});

// ── Live activity feed ────────────────────────────────────────────────────────

function LiveFeed() {
  const [idx, setIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % FEED_ITEMS.length);
        setVisible(true);
      }, 400);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-label="Live activity"
      className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden max-w-xl w-full"
    >
      {/* Pulse dot */}
      <span className="relative flex size-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex size-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-green-400" />
      </span>

      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={idx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-white font-medium truncate"
          >
            {FEED_ITEMS[idx]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface HeroSectionProps {
  className?: string;
}

/**
 * DosAgrolink hero section — full-viewport landing block with headline,
 * user-type cards, live activity feed, and trust indicators.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <section
      aria-label="Welcome to DosAgrolink"
      className={cn(
        "relative min-h-svh w-full flex flex-col items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* ── Background ─────────────────────────────────────────────────────── */}
      {/* Gradient base */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-cyan-700"
      />

      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-farm.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply pointer-events-none select-none"
        loading="eager"
      />

      {/* Grain texture overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial soft spotlight */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary-500/20 blur-3xl pointer-events-none"
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-12">

        {/* Badge */}
        <motion.div {...fadeDown(0.1)}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/15 border border-white/25 text-green-100 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
            Nigeria&apos;s #1 Agri Marketplace
          </span>
        </motion.div>

        {/* Headline */}
        <div className="text-center space-y-5 max-w-4xl">
          <motion.h1
            {...fadeDown(0.2)}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-md"
          >
            Nigeria&apos;s Digital{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">
                Agriculture
              </span>
              {/* Underline decoration */}
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: EASE_STANDARD }}
                style={{ transformOrigin: "left" }}
              />
            </span>{" "}
            Ecosystem
          </motion.h1>

          <motion.p
            {...fadeUp(0.35)}
            className="text-xl md:text-2xl text-green-100/90 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Connecting <strong className="text-white">50,000+ Farmers</strong> to Markets, Finance &amp; Growth
          </motion.p>
        </div>

        {/* User-type cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_STANDARD, delay: 0.45 }}
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"
        >
          {USER_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <Link
                href={card.href}
                className={cn(
                  "flex flex-col gap-4 p-6 rounded-2xl h-full",
                  "bg-white/10 backdrop-blur-md border border-white/20",
                  "hover:bg-white/[0.17] hover:border-white/40 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  card.ring
                )}
                aria-label={`${card.title} – ${card.description}`}
              >
                {/* Icon */}
                <div
                  className="size-14 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: card.accentLight, border: `1.5px solid ${card.accent}55` }}
                  aria-hidden
                >
                  {card.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 space-y-1.5">
                  <h2 className="text-lg font-bold text-white">{card.title}</h2>
                  <p className="text-sm text-green-100/80 leading-relaxed">{card.description}</p>
                </div>

                {/* CTA */}
                <span
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
                    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2",
                    card.ctaClass
                  )}
                >
                  {card.cta}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Live activity feed */}
        <motion.div
          {...fadeUp(0.6)}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-xs text-green-200/60 uppercase tracking-widest font-medium">Live Activity</p>
          <LiveFeed />
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          {...fadeUp(0.72)}
          className="w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
            {TRUST.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && (
                  <span aria-hidden className="hidden sm:block w-px h-5 bg-white/20 rounded-full" />
                )}
                <div className="flex items-center gap-2 text-green-100/80 text-sm font-medium">
                  <span className="text-green-300">{item.icon}</span>
                  {item.label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"
      />

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
