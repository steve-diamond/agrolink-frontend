"use client";

/**
 * MarketplaceFilters — sidebar / mobile-drawer filter panel
 *
 * IMPORTANT: This component calls useSearchParams(). Wrap its usage site in
 * a React <Suspense> boundary to avoid build errors in Next.js 15:
 *
 *   <Suspense fallback={<FilterSkeleton />}>
 *     <MarketplaceFilters />
 *   </Suspense>
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { cn } from "@/components/ui/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

const CATEGORIES = [
  { id: "grains", label: "Grains & Cereals" },
  { id: "tubers", label: "Tubers & Roots" },
  { id: "vegetables", label: "Vegetables" },
  { id: "fruits", label: "Fruits" },
  { id: "livestock", label: "Livestock" },
  { id: "poultry", label: "Poultry" },
  { id: "fish", label: "Fish & Seafood" },
  { id: "spices", label: "Spices & Herbs" },
  { id: "oilseeds", label: "Oilseeds" },
  { id: "processed", label: "Processed Foods" },
] as const;

const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;
const PRICE_STEP = 1_000;

const RATING_OPTIONS = [
  { value: "4+" as const, label: "4+ Stars", stars: 4 },
  { value: "3+" as const, label: "3+ Stars", stars: 3 },
  { value: "2+" as const, label: "2+ Stars", stars: 2 },
  { value: "all" as const, label: "Any Rating", stars: 0 },
];

const DISTANCE_OPTIONS = [
  { value: "50" as const, label: "Within 50 km" },
  { value: "100" as const, label: "Within 100 km" },
  { value: "200" as const, label: "Within 200 km" },
  { value: "nationwide" as const, label: "Nationwide" },
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const filterSchema = z.object({
  category: z.array(z.string()),
  location: z.array(z.string()),
  priceMin: z.number().min(PRICE_MIN).max(PRICE_MAX),
  priceMax: z.number().min(PRICE_MIN).max(PRICE_MAX),
  grade: z.enum(["premium", "standard", "economy", ""]),
  availability: z.array(z.enum(["in_stock", "pre_order"])),
  rating: z.enum(["4+", "3+", "2+", "all"]),
  distance: z.enum(["50", "100", "200", "nationwide", ""]),
});

export type FilterValues = z.infer<typeof filterSchema>;

// ─── URL param helpers ────────────────────────────────────────────────────────

function parseParams(params: URLSearchParams): Partial<FilterValues> {
  const result: Partial<FilterValues> = {};

  const cats = params.get("category");
  if (cats) result.category = cats.split(",").filter(Boolean);

  const locs = params.get("location");
  if (locs) result.location = locs.split(",").filter(Boolean);

  const pMin = params.get("priceMin");
  if (pMin) result.priceMin = Number(pMin);

  const pMax = params.get("priceMax");
  if (pMax) result.priceMax = Number(pMax);

  const grade = params.get("grade");
  if (grade) result.grade = grade as FilterValues["grade"];

  const avail = params.get("availability");
  if (avail)
    result.availability = avail.split(",").filter(Boolean) as FilterValues["availability"];

  const rating = params.get("rating");
  if (rating) result.rating = rating as FilterValues["rating"];

  const dist = params.get("distance");
  if (dist) result.distance = dist as FilterValues["distance"];

  return result;
}

function serializeFilters(values: FilterValues): URLSearchParams {
  const params = new URLSearchParams();

  if (values.category.length) params.set("category", values.category.join(","));
  if (values.location.length) params.set("location", values.location.join(","));
  if (values.priceMin > PRICE_MIN) params.set("priceMin", String(values.priceMin));
  if (values.priceMax < PRICE_MAX) params.set("priceMax", String(values.priceMax));
  if (values.grade) params.set("grade", values.grade);
  if (values.availability.length)
    params.set("availability", values.availability.join(","));
  if (values.rating !== "all") params.set("rating", values.rating);
  if (values.distance) params.set("distance", values.distance);

  return params;
}

function countActive(values: FilterValues): number {
  let n = 0;
  if (values.category.length) n++;
  if (values.location.length) n++;
  if (values.priceMin > PRICE_MIN || values.priceMax < PRICE_MAX) n++;
  if (values.grade) n++;
  if (values.availability.length) n++;
  if (values.rating !== "all") n++;
  if (values.distance) n++;
  return n;
}

const DEFAULT_VALUES: FilterValues = {
  category: [],
  location: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  grade: "",
  availability: [],
  rating: "all",
  distance: "",
};

// ─── FilterSection (accordion) ────────────────────────────────────────────────

interface FilterSectionProps {
  title: string;
  /** Number of active filters in this section — shows a badge if > 0 */
  activeCount?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({
  title,
  activeCount = 0,
  defaultOpen = false,
  children,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-3.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-sm"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white leading-none">
              {activeCount}
            </span>
          )}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <ChevronDownIcon className="size-4 text-gray-400 shrink-0" aria-hidden />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PriceRangeSlider ─────────────────────────────────────────────────────────

interface PriceRangeSliderProps {
  low: number;
  high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}

function PriceRangeSlider({
  low,
  high,
  onLowChange,
  onHighChange,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lowPct = ((low - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const highPct = ((high - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  // Update CSS custom properties on the track element (avoids JSX inline style)
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.setProperty("--low-pct", `${lowPct}%`);
      trackRef.current.style.setProperty("--high-pct", `${100 - highPct}%`);
    }
  }, [lowPct, highPct]);

  const handleLow = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), high - PRICE_STEP);
      onLowChange(v);
    },
    [high, onLowChange]
  );

  const handleHigh = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), low + PRICE_STEP);
      onHighChange(v);
    },
    [low, onHighChange]
  );

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₦${(n / 1_000).toFixed(0)}K`
      : `₦${n}`;

  return (
    <div className="space-y-3">
      {/* Slider track */}
      <style>{`
        .price-track::after {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: var(--low-pct);
          right: var(--high-pct);
          height: 6px;
          border-radius: 9999px;
          background: rgb(16 185 129);
          pointer-events: none;
        }
        .price-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 50%;
          background: white;
          border: 2.5px solid rgb(16 185 129);
          cursor: grab;
          pointer-events: all;
          box-shadow: 0 1px 4px rgba(0,0,0,.4);
        }
        .price-range::-moz-range-thumb {
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 50%;
          background: white;
          border: 2.5px solid rgb(16 185 129);
          cursor: grab;
          pointer-events: all;
          box-shadow: 0 1px 4px rgba(0,0,0,.4);
        }
        .price-range {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={trackRef}
        className="price-track relative h-5 w-full"
        aria-hidden
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-white/15" />

        {/* Min input */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={low}
          onChange={handleLow}
          className={cn(
            "price-range absolute inset-0 w-full h-full",
            lowPct >= 90 ? "z-20" : "z-10"
          )}
          aria-label="Minimum price"
        />

        {/* Max input */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={high}
          onChange={handleHigh}
          className={cn(
            "price-range absolute inset-0 w-full h-full",
            lowPct >= 90 ? "z-10" : "z-20"
          )}
          aria-label="Maximum price"
        />
      </div>

      {/* Min / max labels */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{fmt(low)}</span>
        <span>{fmt(high)}</span>
      </div>

      {/* Numeric inputs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Min", value: low, onChange: onLowChange, max: high - PRICE_STEP },
          { label: "Max", value: high, onChange: onHighChange, min: low + PRICE_STEP },
        ].map(({ label, value, onChange, min: minV, max: maxV }) => (
          <label key={label} className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </span>
            <input
              type="number"
              value={value}
              min={minV ?? PRICE_MIN}
              max={maxV ?? PRICE_MAX}
              step={PRICE_STEP}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v)) onChange(v);
              }}
              className={cn(
                "w-full rounded-lg px-2.5 py-1.5 text-sm text-white",
                "bg-white/8 border border-white/12",
                "focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40",
                "transition-colors duration-200",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── LocationFilter ───────────────────────────────────────────────────────────

interface LocationFilterProps {
  value: string[];
  onChange: (v: string[]) => void;
}

function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_LIMIT = 8;

  const filtered = NIGERIAN_STATES.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const visible = showAll || query ? filtered : filtered.slice(0, VISIBLE_LIMIT);

  const toggle = (state: string) => {
    onChange(
      value.includes(state)
        ? value.filter((v) => v !== state)
        : [...value, state]
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search states…"
          className={cn(
            "w-full pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-gray-600",
            "bg-white/6 border border-white/10 rounded-lg",
            "focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30",
            "transition-colors duration-200"
          )}
        />
      </div>

      {/* State checkboxes */}
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {visible.length > 0 ? (
          visible.map((state) => (
            <label
              key={state}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer",
                "transition-colors duration-150",
                value.includes(state)
                  ? "bg-emerald-500/12 text-emerald-300"
                  : "hover:bg-white/6 text-gray-300"
              )}
            >
              <input
                type="checkbox"
                checked={value.includes(state)}
                onChange={() => toggle(state)}
                className="size-3.5 rounded border-white/20 bg-white/8 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
              />
              <span className="text-sm leading-none">{state}</span>
            </label>
          ))
        ) : (
          <p className="text-xs text-gray-500 px-2 py-2">No states match.</p>
        )}
      </div>

      {/* Show more / less */}
      {!query && filtered.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {showAll
            ? "Show fewer"
            : `Show all ${filtered.length} states`}
        </button>
      )}

      {/* Selected count */}
      {value.length > 0 && (
        <p className="text-[11px] text-gray-500">
          {value.length} state{value.length !== 1 ? "s" : ""} selected
          <button
            type="button"
            onClick={() => onChange([])}
            className="ml-1.5 text-emerald-400 hover:text-emerald-300 underline"
          >
            clear
          </button>
        </p>
      )}
    </div>
  );
}

// ─── RatingSelector ───────────────────────────────────────────────────────────

interface RatingSelectorProps {
  value: FilterValues["rating"];
  onChange: (v: FilterValues["rating"]) => void;
}

function RatingSelector({ value, onChange }: RatingSelectorProps) {
  return (
    <div className="space-y-1.5" role="radiogroup" aria-label="Seller rating filter">
      {RATING_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
              "transition-all duration-150 border",
              active
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                : "border-white/8 bg-white/4 text-gray-400 hover:bg-white/8 hover:text-gray-200"
            )}
          >
            {/* Stars */}
            {opt.stars > 0 ? (
              <span className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < opt.stars ? (
                      <StarIcon className="size-3 text-amber-400" aria-hidden />
                    ) : (
                      <StarOutline className="size-3 text-gray-600" aria-hidden />
                    )}
                  </span>
                ))}
              </span>
            ) : (
              <span className="size-3 shrink-0" aria-hidden />
            )}
            <span>{opt.label}</span>
            {opt.stars > 0 && (
              <span className="ml-auto text-[10px] text-gray-500">& up</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── FilterContent ────────────────────────────────────────────────────────────

interface FilterContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FilterValues, unknown, FilterValues>;
  values: FilterValues;
  onApply: () => void;
  onClear: () => void;
  activeCount: number;
}

function FilterContent({
  control,
  values,
  onApply,
  onClear,
  activeCount,
}: FilterContentProps) {
  const sectionActive = {
    category: values.category.length,
    location: values.location.length,
    price: values.priceMin > PRICE_MIN || values.priceMax < PRICE_MAX ? 1 : 0,
    grade: values.grade ? 1 : 0,
    availability: values.availability.length,
    rating: values.rating !== "all" ? 1 : 0,
    distance: values.distance ? 1 : 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-white/8">
        {/* ── Category ── */}
        <FilterSection
          title="Category"
          activeCount={sectionActive.category}
          defaultOpen
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-1">
                {CATEGORIES.map((cat) => {
                  const checked = field.value.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer",
                        "transition-colors duration-150 text-sm",
                        checked
                          ? "bg-emerald-500/12 text-emerald-300"
                          : "hover:bg-white/6 text-gray-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          field.onChange(
                            checked
                              ? field.value.filter((v) => v !== cat.id)
                              : [...field.value, cat.id]
                          )
                        }
                        className="size-3.5 rounded border-white/20 bg-white/8 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      {cat.label}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FilterSection>

        {/* ── Location ── */}
        <FilterSection title="Location" activeCount={sectionActive.location}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocationFilter
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FilterSection>

        {/* ── Price Range ── */}
        <FilterSection title="Price Range (₦)" activeCount={sectionActive.price}>
          <Controller
            name="priceMin"
            control={control}
            render={({ field: minField }) => (
              <Controller
                name="priceMax"
                control={control}
                render={({ field: maxField }) => (
                  <PriceRangeSlider
                    low={minField.value}
                    high={maxField.value}
                    onLowChange={minField.onChange}
                    onHighChange={maxField.onChange}
                  />
                )}
              />
            )}
          />
        </FilterSection>

        {/* ── Quality Grade ── */}
        <FilterSection title="Quality Grade" activeCount={sectionActive.grade}>
          <Controller
            name="grade"
            control={control}
            render={({ field }) => (
              <div
                className="space-y-1.5"
                role="radiogroup"
                aria-label="Quality grade"
              >
                {[
                  { value: "", label: "Any Grade" },
                  { value: "premium", label: "Premium", desc: "Top 10% of market" },
                  { value: "standard", label: "Standard", desc: "Market average" },
                  { value: "economy", label: "Economy", desc: "Budget-friendly" },
                ].map((opt) => {
                  const active = field.value === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer",
                        "border transition-all duration-150",
                        active
                          ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                          : "border-white/8 bg-white/4 text-gray-300 hover:bg-white/8"
                      )}
                    >
                      <input
                        type="radio"
                        name="grade"
                        value={opt.value}
                        checked={active}
                        onChange={() => field.onChange(opt.value)}
                        className="size-3.5 border-white/20 bg-white/8 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">
                          {opt.label}
                        </span>
                        {opt.desc && (
                          <span className="text-[11px] text-gray-500 block">
                            {opt.desc}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FilterSection>

        {/* ── Availability ── */}
        <FilterSection
          title="Availability"
          activeCount={sectionActive.availability}
        >
          <Controller
            name="availability"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                {[
                  { value: "in_stock" as const, label: "In Stock", desc: "Ready to ship" },
                  { value: "pre_order" as const, label: "Pre-order", desc: "Future harvest" },
                ].map((opt) => {
                  const checked = field.value.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer",
                        "border transition-all duration-150",
                        checked
                          ? "bg-emerald-500/12 border-emerald-500/30 text-emerald-300"
                          : "border-white/8 bg-white/4 text-gray-300 hover:bg-white/8"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          field.onChange(
                            checked
                              ? field.value.filter((v) => v !== opt.value)
                              : [...field.value, opt.value]
                          )
                        }
                        className="size-3.5 rounded border-white/20 bg-white/8 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">{opt.label}</span>
                        <span className="text-[11px] text-gray-500 block">{opt.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FilterSection>

        {/* ── Seller Rating ── */}
        <FilterSection title="Seller Rating" activeCount={sectionActive.rating}>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <RatingSelector
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FilterSection>

        {/* ── Distance ── */}
        <FilterSection title="Distance" activeCount={sectionActive.distance}>
          <Controller
            name="distance"
            control={control}
            render={({ field }) => (
              <div
                className="space-y-1.5"
                role="radiogroup"
                aria-label="Distance filter"
              >
                {[{ value: "" as const, label: "Any distance" }, ...DISTANCE_OPTIONS].map(
                  (opt) => {
                    const active = field.value === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer",
                          "border transition-all duration-150",
                          active
                            ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                            : "border-white/8 bg-white/4 text-gray-300 hover:bg-white/8"
                        )}
                      >
                        <input
                          type="radio"
                          name="distance"
                          value={opt.value}
                          checked={active}
                          onChange={() => field.onChange(opt.value)}
                          className="size-3.5 border-white/20 bg-white/8 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    );
                  }
                )}
              </div>
            )}
          />
        </FilterSection>
      </div>

      {/* ── Action bar ── */}
      <div className="shrink-0 p-4 border-t border-white/8 space-y-2">
        <button
          type="submit"
          onClick={onApply}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700",
            "text-sm font-semibold text-white transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
            "shadow shadow-emerald-900/40"
          )}
        >
          <FunnelIcon className="size-4" aria-hidden />
          Apply Filters
          {activeCount > 0 && (
            <span className="flex items-center justify-center size-5 rounded-full bg-emerald-800 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl",
              "text-sm text-gray-400 hover:text-white",
              "border border-white/10 hover:border-white/20",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            )}
          >
            <XMarkIcon className="size-4" aria-hidden />
            Clear All ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MarketplaceFilters ───────────────────────────────────────────────────────

export interface MarketplaceFiltersProps {
  /** Called whenever filters are applied — receives serialised values */
  onFiltersChange?: (values: FilterValues) => void;
  /** Additional className on the desktop sidebar wrapper */
  className?: string;
}

export function MarketplaceFilters({
  onFiltersChange,
  className,
}: MarketplaceFiltersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse URL params into form defaults on mount
  const urlDefaults = {
    ...DEFAULT_VALUES,
    ...parseParams(searchParams),
  };

  const { control, handleSubmit, reset, watch } = useForm<FilterValues, unknown, FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: urlDefaults,
  });

  const values = watch();
  const activeCount = countActive(values);

  // Keep form in sync if URL params change externally (e.g. browser back)
  useEffect(() => {
    reset({ ...DEFAULT_VALUES, ...parseParams(searchParams) });
  }, [searchParams, reset]);

  const onApply = useCallback(
    (data: FilterValues) => {
      const params = serializeFilters(data);
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      onFiltersChange?.(data);
      setDrawerOpen(false);
    },
    [router, pathname, onFiltersChange]
  );

  const onClear = useCallback(() => {
    reset(DEFAULT_VALUES);
    router.push(pathname);
    onFiltersChange?.(DEFAULT_VALUES);
    setDrawerOpen(false);
  }, [reset, router, pathname, onFiltersChange]);

  const contentProps: FilterContentProps = {
    control,
    values,
    onApply: handleSubmit(onApply),
    onClear,
    activeCount,
  };

  return (
    <>
      {/* ── Mobile trigger button (exported separately via FilterTriggerButton) ── */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className={cn(
          "lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl",
          "bg-white/8 border border-white/12 text-sm font-medium text-white",
          "hover:bg-white/12 transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        )}
        aria-label="Open filters"
        aria-expanded={drawerOpen}
      >
        <AdjustmentsHorizontalIcon className="size-4" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Mobile slide-in drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Marketplace filters"
              className={cn(
                "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[90vw]",
                "bg-gray-900 border-r border-white/8",
                "flex flex-col lg:hidden",
                "shadow-2xl shadow-black/50"
              )}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 shrink-0">
                <h2 className="text-base font-bold text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center size-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="Close filters"
                >
                  <XMarkIcon className="size-5" aria-hidden />
                </button>
              </div>

              <FilterContent {...contentProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sticky sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col",
          "w-64 shrink-0 sticky top-20 max-h-[calc(100vh-5rem)] self-start",
          "rounded-2xl border border-white/8 bg-gray-900/80 backdrop-blur-sm",
          "overflow-hidden",
          className
        )}
        aria-label="Marketplace filters"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="size-4 text-emerald-400" aria-hidden />
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="text-xs text-emerald-400 font-semibold">
              {activeCount} active
            </span>
          )}
        </div>

        <FilterContent {...contentProps} />
      </aside>
    </>
  );
}

export default MarketplaceFilters;
