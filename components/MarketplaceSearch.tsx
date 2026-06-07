"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MicrophoneIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  UserIcon,
  ChevronDownIcon,
  CheckIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/components/ui/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "distance"
  | "rating"
  | "freshness";

export type ViewMode = "grid" | "list";

export interface SearchParams {
  query: string;
  sort: SortOption;
}

export interface MarketplaceSearchProps {
  defaultQuery?: string;
  defaultSort?: SortOption;
  defaultViewMode?: ViewMode;
  onSearch?: (params: SearchParams) => void;
  onQueryChange?: (query: string) => void;
  onSortChange?: (sort: SortOption) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onFilterToggle?: () => void;
  filterActiveCount?: number;
  className?: string;
}

type SuggestionType = "recent" | "product" | "category" | "seller";

interface SuggestionItem {
  id: string;
  type: SuggestionType;
  text: string;
  subtitle?: string;
}

interface SuggestionSection {
  type: SuggestionType;
  label: string;
  icon: React.ReactNode;
  items: SuggestionItem[];
}

// ─── Constants ─────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "distance", label: "Nearest First" },
  { value: "rating", label: "Top Rated" },
  { value: "freshness", label: "Freshest" },
];

const RECENT_SEARCHES_KEY = "agrolink_searches";

const POPULAR_PRODUCTS: SuggestionItem[] = [
  { id: "pp1", type: "product", text: "Ofada Rice", subtitle: "from ₦35K/bag" },
  { id: "pp2", type: "product", text: "Cassava Tubers", subtitle: "from ₦8K/bag" },
  { id: "pp3", type: "product", text: "Tomatoes", subtitle: "from ₦12K/crate" },
  { id: "pp4", type: "product", text: "Yam (Medium)", subtitle: "from ₦3K/tuber" },
  { id: "pp5", type: "product", text: "Palm Oil", subtitle: "from ₦25K/keg" },
  { id: "pp6", type: "product", text: "Groundnut (Shelled)", subtitle: "from ₦18K/bag" },
];

const POPULAR_CATEGORIES: SuggestionItem[] = [
  { id: "cat1", type: "category", text: "Grains & Cereals" },
  { id: "cat2", type: "category", text: "Tubers & Roots" },
  { id: "cat3", type: "category", text: "Vegetables" },
  { id: "cat4", type: "category", text: "Fruits" },
  { id: "cat5", type: "category", text: "Livestock" },
  { id: "cat6", type: "category", text: "Poultry" },
  { id: "cat7", type: "category", text: "Fish & Seafood" },
  { id: "cat8", type: "category", text: "Spices & Herbs" },
  { id: "cat9", type: "category", text: "Oilseeds" },
  { id: "cat10", type: "category", text: "Processed Foods" },
];

const POPULAR_SELLERS: SuggestionItem[] = [
  { id: "sel1", type: "seller", text: "AgriPlus Farms", subtitle: "Lagos · ⭐ 4.9" },
  { id: "sel2", type: "seller", text: "Benue Harvest Cooperative", subtitle: "Benue · ⭐ 4.8" },
  { id: "sel3", type: "seller", text: "Kano Fresh Produce", subtitle: "Kano · ⭐ 4.7" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  if (!query.trim()) return;
  const existing = getRecentSearches();
  const updated = [
    query.trim(),
    ...existing.filter((q) => q !== query.trim()),
  ].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function removeRecentSearch(query: string): void {
  const existing = getRecentSearches();
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(existing.filter((q) => q !== query))
  );
}

// ─── useDebounce ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── HighlightText ─────────────────────────────────────────────────────────

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-transparent text-emerald-300 font-semibold not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── VoiceSearchButton ─────────────────────────────────────────────────────

type WebkitWindow = typeof window & {
  webkitSpeechRecognition?: new () => SpeechRecognition;
};

function VoiceSearchButton({
  onTranscript,
  disabled,
  className,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const w = window as WebkitWindow;
    setAvailable(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  const handleToggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const w = window as WebkitWindow;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    try {
      const recognition = new SR();
      recognition.lang = "en-NG";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        if (transcript) onTranscript(transcript.trim());
        setListening(false);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening, onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={listening ? "Stop voice search" : "Start voice search"}
      aria-pressed={listening}
      title={listening ? "Listening…" : "Search by voice"}
      className={cn(
        "flex items-center justify-center rounded-lg p-2 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        listening
          ? "text-rose-400"
          : "text-white/50 hover:text-white/80",
        className
      )}
    >
      {listening ? (
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
          className="flex"
        >
          <MicrophoneIcon className="size-4 text-rose-400" />
        </motion.span>
      ) : (
        <MicrophoneIcon className="size-4" />
      )}
    </button>
  );
}

// ─── SuggestionIcon ────────────────────────────────────────────────────────

function SuggestionIcon({ type }: { type: SuggestionType }) {
  const base = "size-4 flex-shrink-0";
  switch (type) {
    case "recent":
      return <ClockIcon className={cn(base, "text-white/40")} />;
    case "product":
      return <FireIcon className={cn(base, "text-amber-400")} />;
    case "category":
      return <TagIcon className={cn(base, "text-sky-400")} />;
    case "seller":
      return <UserIcon className={cn(base, "text-violet-400")} />;
  }
}

// ─── SortDropdown ──────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
  className,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  className?: string;
}) {
  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]!;

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={cn("relative", className)}>
        <ListboxButton
          className={cn(
            "group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
            "bg-white/8 border border-white/12 text-white/80",
            "hover:bg-white/12 transition-colors whitespace-nowrap",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          )}
        >
          <span className="text-white/45 text-xs mr-0.5">Sort:</span>
          <span>{selected.label}</span>
          <ChevronDownIcon className="size-3.5 text-white/50 transition-transform group-data-[open]:rotate-180" />
        </ListboxButton>

        <ListboxOptions
          transition
          className={cn(
            "absolute left-0 top-full mt-1.5 z-50 min-w-44",
            "rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/12",
            "shadow-xl shadow-black/40 py-1 focus:outline-none",
            // CSS transitions via Headless UI data attributes
            "transition duration-150 ease-out",
            "data-[closed]:opacity-0 data-[closed]:-translate-y-2"
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ focus }: { focus: boolean }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors",
                  focus ? "bg-white/8 text-white" : "text-white/70"
                )
              }
            >
              {({ selected: isSel }: { selected: boolean }) => (
                <>
                  <CheckIcon
                    className={cn(
                      "size-3.5 flex-shrink-0 transition-opacity",
                      isSel ? "opacity-100 text-emerald-400" : "opacity-0"
                    )}
                  />
                  <span className={isSel ? "text-emerald-300 font-medium" : ""}>
                    {option.label}
                  </span>
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

// ─── ViewToggle ────────────────────────────────────────────────────────────

function ViewToggle({
  value,
  onChange,
  className,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className={cn(
        "flex items-center rounded-lg border border-white/12 bg-white/8 p-0.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label="Grid view"
        title="Grid view"
        className={cn(
          "flex items-center justify-center rounded-md p-1.5 transition-colors",
          value === "grid"
            ? "bg-emerald-600 text-white"
            : "text-white/50 hover:text-white/80"
        )}
      >
        <Squares2X2Icon className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        aria-label="List view"
        title="List view"
        className={cn(
          "flex items-center justify-center rounded-md p-1.5 transition-colors",
          value === "list"
            ? "bg-emerald-600 text-white"
            : "text-white/50 hover:text-white/80"
        )}
      >
        <ListBulletIcon className="size-4" />
      </button>
    </div>
  );
}

// ─── MarketplaceSearch ─────────────────────────────────────────────────────

export function MarketplaceSearch({
  defaultQuery = "",
  defaultSort = "relevance",
  defaultViewMode = "grid",
  onSearch,
  onQueryChange,
  onSortChange,
  onViewModeChange,
  onFilterToggle,
  filterActiveCount = 0,
  className,
}: MarketplaceSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();

  // ── ID helpers (stable per component instance)
  const listboxId = `${uid}-listbox`;
  const optionId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  // ── State
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [sort, setSort] = useState<SortOption>(defaultSort);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ── Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Debounce
  const debouncedQuery = useDebounce(query, 300);

  // ── Load recents from localStorage
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ── Click outside → close
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // ── Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0) {
      document
        .getElementById(optionId(activeIndex))
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, optionId]);

  // ── Notify parent of query changes (debounced)
  useEffect(() => {
    onQueryChange?.(debouncedQuery);
  }, [debouncedQuery, onQueryChange]);

  // ── Build suggestion sections
  const sections = useMemo<SuggestionSection[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();

    if (!q) {
      const result: SuggestionSection[] = [];
      if (recentSearches.length) {
        result.push({
          type: "recent",
          label: "Recent searches",
          icon: <ClockIcon className="size-3.5" />,
          items: recentSearches.map((r) => ({
            id: `recent-${r}`,
            type: "recent" as const,
            text: r,
          })),
        });
      }
      result.push({
        type: "product",
        label: "Popular products",
        icon: <FireIcon className="size-3.5" />,
        items: POPULAR_PRODUCTS.slice(0, 4),
      });
      result.push({
        type: "category",
        label: "Categories",
        icon: <TagIcon className="size-3.5" />,
        items: POPULAR_CATEGORIES.slice(0, 5),
      });
      result.push({
        type: "seller",
        label: "Top sellers",
        icon: <UserIcon className="size-3.5" />,
        items: POPULAR_SELLERS,
      });
      return result;
    }

    // Filter by query
    const matchRecent = recentSearches
      .filter((r) => r.toLowerCase().includes(q))
      .map((r) => ({ id: `recent-${r}`, type: "recent" as const, text: r }));

    const matchProducts = POPULAR_PRODUCTS.filter((p) =>
      p.text.toLowerCase().includes(q)
    );
    const matchCategories = POPULAR_CATEGORIES.filter((c) =>
      c.text.toLowerCase().includes(q)
    );
    const matchSellers = POPULAR_SELLERS.filter((s) =>
      s.text.toLowerCase().includes(q)
    );

    const result: SuggestionSection[] = [];
    if (matchRecent.length)
      result.push({
        type: "recent",
        label: "Recent",
        icon: <ClockIcon className="size-3.5" />,
        items: matchRecent,
      });
    if (matchProducts.length)
      result.push({
        type: "product",
        label: "Products",
        icon: <FireIcon className="size-3.5" />,
        items: matchProducts,
      });
    if (matchCategories.length)
      result.push({
        type: "category",
        label: "Categories",
        icon: <TagIcon className="size-3.5" />,
        items: matchCategories,
      });
    if (matchSellers.length)
      result.push({
        type: "seller",
        label: "Sellers",
        icon: <UserIcon className="size-3.5" />,
        items: matchSellers,
      });
    return result;
  }, [debouncedQuery, recentSearches]);

  // Flat array for keyboard navigation
  const flatItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections]
  );

  // Map itemId → flat index (avoids mutable counter during render)
  const itemIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const section of sections) {
      for (const item of section.items) {
        map.set(item.id, idx++);
      }
    }
    return map;
  }, [sections]);

  // ── Action handlers
  const handleSearch = useCallback(
    (q: string = query) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      addRecentSearch(trimmed);
      setRecentSearches(getRecentSearches());
      setOpen(false);
      setActiveIndex(-1);
      const params = new URLSearchParams({ q: trimmed, sort });
      router.push(`${pathname}?${params.toString()}`);
      onSearch?.({ query: trimmed, sort });
    },
    [query, sort, pathname, router, onSearch]
  );

  const handleSelect = useCallback(
    (item: SuggestionItem) => {
      if (item.type === "category") {
        setOpen(false);
        setActiveIndex(-1);
        const params = new URLSearchParams({ category: item.text, sort });
        router.push(`${pathname}?${params.toString()}`);
      } else {
        setQuery(item.text);
        handleSearch(item.text);
      }
    },
    [handleSearch, sort, pathname, router]
  );

  const handleRemoveRecent = useCallback(
    (e: React.MouseEvent, text: string) => {
      e.stopPropagation();
      removeRecentSearch(text);
      setRecentSearches(getRecentSearches());
    },
    []
  );

  const handleSortChange = useCallback(
    (v: SortOption) => {
      setSort(v);
      onSortChange?.(v);
    },
    [onSortChange]
  );

  const handleViewModeChange = useCallback(
    (v: ViewMode) => {
      setViewMode(v);
      onViewModeChange?.(v);
    },
    [onViewModeChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setOpen(true);
          setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (activeIndex >= 0 && flatItems[activeIndex]) {
            e.preventDefault();
            handleSelect(flatItems[activeIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setOpen(false);
          setActiveIndex(-1);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    },
    [activeIndex, flatItems, handleSelect, handleSearch]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* ── Row 1: Search input ─────────────────────────────── */}
      <div ref={containerRef} className="relative flex gap-2">
        {/* Input wrapper */}
        <div className="relative flex-1">
          {/* Search icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <MagnifyingGlassIcon className="size-5 text-white/40" />
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? optionId(activeIndex) : undefined
            }
            placeholder="Search products, farms, categories…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full rounded-xl border border-white/12 bg-white/8 py-3 pl-10 pr-20",
              "text-sm text-white placeholder:text-white/35",
              "transition-colors focus:outline-none",
              "focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20",
              "[&::-webkit-search-cancel-button]:hidden"
            )}
          />

          {/* Right action buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
            <AnimatePresence>
              {query && (
                <motion.button
                  key="clear"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.12 }}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveIndex(-1);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="rounded-md p-1.5 text-white/40 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <XMarkIcon className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <VoiceSearchButton
              onTranscript={(t) => {
                setQuery(t);
                setOpen(true);
              }}
            />
          </div>
        </div>

        {/* Filter toggle — visible on mobile only */}
        {onFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            aria-label={`Filters${filterActiveCount > 0 ? `, ${filterActiveCount} active` : ""}`}
            className={cn(
              "relative flex items-center gap-1.5 rounded-xl px-3.5 py-3",
              "border text-sm font-medium transition-colors lg:hidden",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
              filterActiveCount > 0
                ? "border-emerald-500/40 bg-emerald-600/20 text-emerald-300"
                : "border-white/12 bg-white/8 text-white/70 hover:bg-white/12"
            )}
          >
            <AdjustmentsHorizontalIcon className="size-5" />
            <span className="sr-only sm:not-sr-only">Filters</span>
            {filterActiveCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {filterActiveCount}
              </span>
            )}
          </button>
        )}

        {/* ── Autocomplete dropdown ─────────────────────────── */}
        <AnimatePresence>
          {open && flatItems.length > 0 && (
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              id={listboxId}
              role="listbox"
              aria-label="Search suggestions"
              className={cn(
                "absolute left-0 top-full z-50 mt-1.5",
                // Align with input only (exclude filter button width)
                "right-0 lg:right-auto lg:w-[calc(100%-0px)]",
                "max-h-[420px] overflow-y-auto",
                "rounded-2xl border border-white/12 bg-slate-900/95 backdrop-blur-md",
                "shadow-2xl shadow-black/50 py-1"
              )}
            >
              {sections.map((section) => (
                <div
                  key={section.type}
                  role="group"
                  aria-label={section.label}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-1.5 px-4 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-wider text-white/35">
                    {section.icon}
                    <span>{section.label}</span>
                  </div>

                  {/* Suggestion items */}
                  {section.items.map((item) => {
                    const idx = itemIndexMap.get(item.id) ?? -1;
                    const isActive = idx === activeIndex;

                    return (
                      <div
                        key={item.id}
                        id={optionId(idx)}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors",
                          isActive ? "bg-white/8" : "hover:bg-white/5"
                        )}
                      >
                        <SuggestionIcon type={item.type} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white/80">
                            <HighlightText
                              text={item.text}
                              query={debouncedQuery}
                            />
                          </p>
                          {item.subtitle && (
                            <p className="mt-0.5 truncate text-xs text-white/40">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Remove button — recents only */}
                        {item.type === "recent" && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveRecent(e, item.text)}
                            aria-label={`Remove "${item.text}" from recent searches`}
                            className="ml-auto rounded-md p-1 text-white/25 transition-colors hover:text-white/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                          >
                            <XMarkIcon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* "Search all results" footer */}
              {query.trim() && (
                <div className="mt-1 border-t border-white/8 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-white/5"
                  >
                    <MagnifyingGlassIcon className="size-4 flex-shrink-0" />
                    <span>
                      Search all results for{" "}
                      <strong className="font-semibold">
                        &ldquo;{query.trim()}&rdquo;
                      </strong>
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Row 2: Controls ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <SortDropdown value={sort} onChange={handleSortChange} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Filter toggle — desktop variant */}
        {onFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            className={cn(
              "hidden lg:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
              "border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
              filterActiveCount > 0
                ? "border-emerald-500/40 bg-emerald-600/20 text-emerald-300"
                : "border-white/12 bg-white/8 text-white/70 hover:bg-white/12"
            )}
          >
            <AdjustmentsHorizontalIcon className="size-4" />
            <span>Filters</span>
            {filterActiveCount > 0 && (
              <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {filterActiveCount}
              </span>
            )}
          </button>
        )}

        <ViewToggle value={viewMode} onChange={handleViewModeChange} />
      </div>
    </div>
  );
}

export default MarketplaceSearch;
