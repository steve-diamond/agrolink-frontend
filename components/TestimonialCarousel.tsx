"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  StarIcon,
  CheckBadgeIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TestimonialMetric {
  /** Short label, e.g. "Yield Improvement" */
  label: string;
  /** Formatted value, e.g. "2×" or "+₦480K" */
  value: string;
}

export interface Testimonial {
  /** Stable unique ID */
  id: string;
  /** Full quote text (without surrounding quotation marks) */
  quote: string;
  /** Farmer full name */
  name: string;
  /** Display format: "State, Nigeria" */
  location: string;
  /** Primary crop(s) grown, e.g. "Maize & Sorghum" */
  crop: string;
  /** Star rating — 1 to 5, supports .5 increments */
  rating: number;
  /** Photo URL or root-relative path (/images/…) */
  photo: string;
  /** Whether DosAgrolink has verified this farmer's account */
  verified: boolean;
  /**
   * YouTube video URL (https://youtu.be/… or https://www.youtube.com/watch?v=…).
   * Only YouTube URLs are accepted — other URLs are silently ignored for security.
   */
  videoUrl?: string;
  /** Up to 3 impact metrics displayed at the bottom of the card */
  metrics: TestimonialMetric[];
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "DosAgrolink connected me directly to buyers in Lagos. My maize no longer rots in storage — I sold everything within 3 days of harvest at a fair price.",
    name: "Adamu Bello",
    location: "Kaduna, Nigeria",
    crop: "Maize & Sorghum",
    rating: 5,
    photo: "/images/testimonials/adamu-bello.jpg",
    verified: true,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    metrics: [
      { label: "Yield Improvement", value: "2×" },
      { label: "Income Increase", value: "+₦480K" },
      { label: "Buyers Connected", value: "14" },
    ],
  },
  {
    id: "t2",
    quote:
      "The grading system gave buyers confidence in my produce. I now command premium prices because my cassava is certified Grade A on the platform.",
    name: "Ngozi Okafor",
    location: "Enugu, Nigeria",
    crop: "Cassava & Yam",
    rating: 5,
    photo: "/images/testimonials/ngozi-okafor.jpg",
    verified: true,
    metrics: [
      { label: "Price Premium", value: "+35%" },
      { label: "Export Orders", value: "3" },
      { label: "Tonnes Sold", value: "48 T" },
    ],
  },
  {
    id: "t3",
    quote:
      "The input financing unlocked fertilisers I could never afford upfront. My tomato yield tripled this season and I repaid the loan entirely from the proceeds.",
    name: "Emeka Eze",
    location: "Anambra, Nigeria",
    crop: "Tomato & Pepper",
    rating: 4.5,
    photo: "/images/testimonials/emeka-eze.jpg",
    verified: true,
    videoUrl: "https://youtu.be/dQw4w9WgXcQ",
    metrics: [
      { label: "Yield Increase", value: "3×" },
      { label: "Loan Repaid", value: "100%" },
      { label: "Net Profit", value: "₦1.2M" },
    ],
  },
  {
    id: "t4",
    quote:
      "As a cooperative leader, DosAgrolink helps me aggregate produce from 40 members and negotiate bulk contracts we could never have secured individually.",
    name: "Aisha Musa",
    location: "Sokoto, Nigeria",
    crop: "Millet & Groundnut",
    rating: 5,
    photo: "/images/testimonials/aisha-musa.jpg",
    verified: true,
    metrics: [
      { label: "Members Served", value: "40" },
      { label: "Bulk Contracts", value: "6 / yr" },
      { label: "Shared Revenue", value: "₦3.8M" },
    ],
  },
  {
    id: "t5",
    quote:
      "I used to travel four hours to find a buyer. Now orders come to me. The logistics feature even arranges pickup directly from my farm gate.",
    name: "Femi Adeyemi",
    location: "Oyo, Nigeria",
    crop: "Cocoa & Plantain",
    rating: 4.5,
    photo: "/images/testimonials/femi-adeyemi.jpg",
    verified: true,
    metrics: [
      { label: "Logistics Cost", value: "−60%" },
      { label: "Market Reach", value: "5 States" },
      { label: "Time to Sale", value: "< 48 hrs" },
    ],
  },
  {
    id: "t6",
    quote:
      "The price intelligence tool tells me exactly when to sell and at what price. I have not sold below market rate even once since I joined DosAgrolink.",
    name: "Hauwa Garba",
    location: "Kano, Nigeria",
    crop: "Onion & Ginger",
    rating: 5,
    photo: "/images/testimonials/hauwa-garba.jpg",
    verified: true,
    metrics: [
      { label: "Above-Market Sales", value: "100%" },
      { label: "Price Alerts Used", value: "47" },
      { label: "Annual Revenue", value: "₦2.1M" },
    ],
  },
];

// ─── Security helper ──────────────────────────────────────────────────────────

/**
 * Validates a YouTube URL and returns a safe embed URL with autoplay.
 * Strictly accepts youtube.com and youtu.be hostnames only.
 * Video IDs must match the standard 11-character alphanumeric pattern.
 * Returns null for any non-YouTube or malformed URL.
 */
function getSafeYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const isMainDomain =
    parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com";

  if (isMainDomain && parsed.pathname === "/watch") {
    const videoId = parsed.searchParams.get("v");
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  if (parsed.hostname === "youtu.be") {
    const videoId = parsed.pathname.replace(/^\//, "");
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  return null;
}

// ─── StarRating ───────────────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number;
  className?: string;
}

function StarRating({ rating, className }: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i + 0.5 <= rating;
        return (
          <span key={i} className="relative inline-block size-4 shrink-0">
            {/* Base star (outline) */}
            <StarIcon
              className={cn(
                "absolute inset-0 size-4",
                filled || half ? "text-amber-400" : "text-gray-600"
              )}
            />
            {/* Half-filled overlay — clip right half */}
            {half && (
              <span className="absolute inset-0 [clip-path:inset(0_50%_0_0)] overflow-hidden">
                <StarIcon className="size-4 text-amber-400" />
              </span>
            )}
            {/* Fully filled overlay */}
            {!half && !filled && null}
          </span>
        );
      })}
    </div>
  );
}

// ─── VideoModal (portal) ──────────────────────────────────────────────────────

interface VideoModalProps {
  embedUrl: string;
  farmerName: string;
  onClose: () => void;
}

function VideoModal({ embedUrl, farmerName, onClose }: VideoModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // SSR guard — portals require the DOM
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />

        {/* Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Video testimonial from ${farmerName}`}
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-gray-950"
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Close */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex items-center justify-center size-8 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close video"
          >
            <XMarkIcon className="size-4" aria-hidden />
          </button>

          {/* 16 : 9 wrapper */}
          <div className="relative w-full pb-[56.25%] h-0 bg-black">
            <iframe
              src={embedUrl}
              title={`${farmerName} — video testimonial`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Attribution strip */}
          <div className="px-4 py-3 bg-gray-900 text-center">
            <p className="text-sm text-gray-400">
              Video testimonial ·{" "}
              <span className="text-white font-medium">{farmerName}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── CropIcon (inline — no heroicons equivalent for plant/leaf) ───────────────

function CropIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8 1C5.24 1 3 3.24 3 6c0 1.86.97 3.48 2.44 4.4L4.5 14h7l-.94-3.6A5 5 0 0013 6c0-2.76-2.24-5-5-5zM6.5 10.28A3 3 0 015 7.5a3 3 0 013-3 3 3 0 013 3 3 3 0 01-1.5 2.78V9a1.5 1.5 0 01-3 0v-.72z" />
    </svg>
  );
}

// ─── TestimonialCard ──────────────────────────────────────────────────────────

interface TestimonialCardProps {
  testimonial: Testimonial;
  isActive: boolean;
}

function TestimonialCard({ testimonial, isActive }: TestimonialCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const embedUrl = testimonial.videoUrl
    ? getSafeYouTubeEmbedUrl(testimonial.videoUrl)
    : null;

  // Initials fallback avatar
  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <motion.div
        animate={
          isActive
            ? { opacity: 1, scale: 1 }
            : { opacity: 0.5, scale: 0.975 }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="h-full select-none"
      >
        <div
          className={cn(
            "relative h-full flex flex-col gap-5 rounded-2xl p-6 sm:p-8",
            "bg-white/5 backdrop-blur-sm",
            "border border-white/10 transition-colors duration-300",
            isActive && "border-white/20 bg-white/[0.07]",
            "shadow-xl shadow-black/30"
          )}
        >
          {/* Decorative quote mark */}
          <ChatBubbleBottomCenterTextIcon
            className="absolute top-5 right-5 size-9 text-emerald-500/15 pointer-events-none"
            aria-hidden
          />

          {/* ── Header row ── */}
          <div className="flex items-start gap-4">
            {/* Photo + overlays */}
            <div className="relative shrink-0">
              <div className="size-18 sm:size-20 rounded-full overflow-hidden ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-gray-900">
                {!imgError ? (
                  // Testimonial photos can be dynamic external URLs loaded at runtime.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.photo}
                    alt={`Photo of ${testimonial.name}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgError(true)}
                    className="size-full object-cover"
                    draggable={false}
                  />
                ) : (
                  /* Initials fallback */
                  <div className="size-full bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg leading-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Video play button */}
              {embedUrl && (
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center size-8 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900"
                  aria-label={`Watch ${testimonial.name}'s video testimonial`}
                >
                  <PlayIcon className="size-3.5 translate-x-px" aria-hidden />
                </button>
              )}

              {/* Verified badge on photo corner */}
              {testimonial.verified && (
                <div
                  className="absolute -top-1.5 -left-1.5 flex items-center justify-center size-6 rounded-full bg-emerald-500 ring-2 ring-gray-900 shadow"
                  aria-label="Verified farmer"
                >
                  <CheckBadgeIcon className="size-4 text-white" aria-hidden />
                </div>
              )}
            </div>

            {/* Name + meta + stars */}
            <div className="flex-1 min-w-0 pt-0.5 space-y-1.5">
              {/* Name row */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white text-base sm:text-lg leading-tight truncate">
                  {testimonial.name}
                </p>
                {testimonial.verified && (
                  <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <CheckBadgeIcon className="size-3" aria-hidden />
                    Verified
                  </span>
                )}
              </div>

              {/* Location + crop */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3 text-gray-500 shrink-0" aria-hidden />
                  {testimonial.location}
                </span>
                <span className="text-gray-600" aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <CropIcon className="size-3 text-emerald-500/70 shrink-0" />
                  {testimonial.crop}
                </span>
              </div>

              {/* Stars */}
              <StarRating rating={testimonial.rating} />
            </div>
          </div>

          {/* ── Quote ── */}
          <blockquote className="flex-1">
            <p className="text-gray-200 text-sm sm:text-[15px] leading-relaxed italic">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
          </blockquote>

          {/* ── Metrics strip ── */}
          {testimonial.metrics.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 pt-4 border-t border-white/8"
              role="list"
              aria-label={`Impact metrics for ${testimonial.name}`}
            >
              {testimonial.metrics.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1 rounded-xl bg-white/5 border border-white/8 px-2 py-2.5 text-center"
                >
                  <span className="text-base sm:text-lg font-black text-emerald-400 leading-none">
                    {m.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 leading-tight">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Video modal rendered into document.body via portal */}
      {videoOpen && embedUrl && (
        <VideoModal
          embedUrl={embedUrl}
          farmerName={testimonial.name}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </>
  );
}

// ─── NavigationArrow ─────────────────────────────────────────────────────────

interface NavigationArrowProps {
  direction: "prev" | "next";
  onClick: () => void;
}

function NavigationArrow({ direction, onClick }: NavigationArrowProps) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10",
        isPrev
          ? "-left-3 sm:-left-5 -translate-x-full"
          : "-right-3 sm:-right-5 translate-x-full",
        "flex items-center justify-center size-10 rounded-full",
        "bg-gray-800/90 border border-white/10 text-white shadow-lg",
        "hover:bg-gray-700 hover:border-white/25 hover:scale-105",
        "active:scale-95",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      )}
      aria-label={isPrev ? "Previous testimonial" : "Next testimonial"}
    >
      {isPrev ? (
        <ChevronLeftIcon className="size-5" aria-hidden />
      ) : (
        <ChevronRightIcon className="size-5" aria-hidden />
      )}
    </button>
  );
}

// ─── NavigationDots ───────────────────────────────────────────────────────────

interface NavigationDotsProps {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function NavigationDots({
  count,
  selectedIndex,
  onSelect,
}: NavigationDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 mt-8"
      role="group"
      aria-label="Testimonial slide navigation"
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to testimonial ${i + 1} of ${count}`}
          onClick={() => onSelect(i)}
          className={cn(
            "rounded-full transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            i === selectedIndex
              ? "w-7 h-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : "w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400"
          )}
        />
      ))}
    </div>
  );
}

// ─── Progress bar (autoplay indicator) ───────────────────────────────────────

interface AutoplayProgressProps {
  /** delay in ms — used for CSS animation duration */
  delay: number;
  /** Increments when the slide changes — resets the bar */
  slideKey: number;
}

function AutoplayProgress({ delay, slideKey }: AutoplayProgressProps) {
  return (
    <div
      className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-white/10 overflow-hidden"
      aria-hidden
    >
      <motion.div
        key={slideKey}
        className="h-full bg-emerald-500/60 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: delay / 1000, ease: "linear" }}
      />
    </div>
  );
}

// ─── TestimonialCarousel ──────────────────────────────────────────────────────

export interface TestimonialCarouselProps {
  /** Override the seed testimonials */
  testimonials?: Testimonial[];
  /** Section heading */
  heading?: string;
  /** Section subheading */
  subheading?: string;
  /**
   * Auto-advance delay in milliseconds.
   * Pass 0 to disable autoplay entirely.
   * @default 5500
   */
  autoplayDelay?: number;
  /** Additional className on the section element */
  className?: string;
}

export function TestimonialCarousel({
  testimonials = DEFAULT_TESTIMONIALS,
  heading = "Farmers Who Transformed Their Harvest",
  subheading =
    "Real stories from verified DosAgrolink members across Nigeria.",
  autoplayDelay = 5500,
  className,
}: TestimonialCarouselProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Stable autoplay plugin ref — must not be recreated on each render
  const autoplayPlugin = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      // Reduce animation speed for users who prefer reduced motion
      duration: prefersReducedMotion ? 0 : 28,
    },
    autoplayDelay > 0 ? [autoplayPlugin.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  return (
    <section
      aria-labelledby="testimonials-heading"
      className={cn(
        "relative isolate overflow-hidden py-20 sm:py-28",
        "bg-linear-to-b from-gray-900 via-gray-900 to-gray-950",
        className
      )}
    >
      {/* Top/bottom rule accents */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-500/15 to-transparent"
        aria-hidden
      />

      {/* Ambient radial glow */}
      <div
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Heading ── */}
        <div className="text-center mb-14 space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-emerald-400">
            <span
              className="block size-1.5 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden
            />
            Success Stories
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
          >
            {heading}
          </h2>
          <p className="mx-auto max-w-xl text-base sm:text-lg text-gray-400 leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* ── Carousel ── */}
        <div className="relative px-8 sm:px-12">
          {/* Embla viewport — overflow:hidden clips slides */}
          <div
            ref={emblaRef}
            role="region"
            className="overflow-hidden"
            aria-roledescription="carousel"
            aria-label="Farmer testimonials"
          >
            {/* Embla container — flex row of slides */}
            <div className="flex gap-4 sm:gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={t.id}
                  /* Slide width: 540px max, or viewport width minus side padding */
                  className="flex-none w-[min(540px,calc(100vw-4rem))] sm:w-[min(600px,calc(100vw-6rem))]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Testimonial ${idx + 1} of ${testimonials.length} — ${t.name}`}
                >
                  <TestimonialCard
                    testimonial={t}
                    isActive={idx === selectedIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows */}
          <NavigationArrow direction="prev" onClick={scrollPrev} />
          <NavigationArrow direction="next" onClick={scrollNext} />
        </div>

        {/* ── Dots ── */}
        {scrollSnaps.length > 1 && (
          <NavigationDots
            count={scrollSnaps.length}
            selectedIndex={selectedIndex}
            onSelect={scrollTo}
          />
        )}

        {/* ── Autoplay progress bar ── */}
        {autoplayDelay > 0 && (
          <AutoplayProgress delay={autoplayDelay} slideKey={selectedIndex} />
        )}

        {/* Screen reader live region */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Showing testimonial {selectedIndex + 1} of {testimonials.length}:{" "}
          {testimonials[selectedIndex]?.name}
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;
