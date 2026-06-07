"use client";

import * as React from "react";
import { createContext, useContext, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Visual animation style for all skeletons under a provider. */
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

/** Controls the sweep/pulse cycle speed. */
export type SkeletonSpeed = "slow" | "normal" | "fast";

interface SkeletonContextValue {
  animation: SkeletonAnimation;
  speed: SkeletonSpeed;
}

// ── Speed → CSS-variable duration map ────────────────────────────────────────

const SPEED_VAL: Record<SkeletonSpeed, string> = {
  slow:   "2.4s",
  normal: "1.5s",
  fast:   "0.9s",
};

// ── Context ───────────────────────────────────────────────────────────────────

const SkeletonContext = createContext<SkeletonContextValue>({
  animation: "shimmer",
  speed: "normal",
});

function useSkeleton() {
  return useContext(SkeletonContext);
}

// ── SkeletonProvider ──────────────────────────────────────────────────────────

export interface SkeletonProviderProps {
  children: React.ReactNode;
  /**
   * Animation style.
   * - "shimmer" — moving linear-gradient sweep (default)
   * - "pulse"   — opacity breathe
   * - "none"    — static placeholder (use for reduced-bandwidth situations)
   */
  animation?: SkeletonAnimation;
  /** Controls the cycle period. Default: "normal". */
  speed?: SkeletonSpeed;
}

/**
 * Optional app-level provider that controls skeleton animation globally.
 * Automatically downgrades to "pulse" when the OS prefers reduced motion.
 *
 * @example
 * // In your root layout or _app:
 * <SkeletonProvider animation="shimmer" speed="normal">
 *   <App />
 * </SkeletonProvider>
 */
export const SkeletonProvider: React.FC<SkeletonProviderProps> = ({
  children,
  animation = "shimmer",
  speed = "normal",
}) => {
  const prefersReduced = useReducedMotion();
  const value = useMemo<SkeletonContextValue>(
    () => ({ animation: prefersReduced ? "pulse" : animation, speed }),
    [animation, speed, prefersReduced],
  );
  return (
    <SkeletonContext.Provider value={value}>
      {children}
    </SkeletonContext.Provider>
  );
};

// ── Base Skeleton ─────────────────────────────────────────────────────────────

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind width class, e.g. "w-full" */
  width?: string;
  /** Tailwind height class, e.g. "h-4" */
  height?: string;
  /** Renders as a circle — for avatars, icons */
  circle?: boolean;
  /** Fully rounded, pill-shaped */
  pill?: boolean;
}

/**
 * Primitive skeleton block. Compose multiple to build complex loading states.
 *
 * @example
 * <Skeleton width="w-full" height="h-4" />
 * <Skeleton circle className="size-10" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle,
  pill,
  style,
  ...props
}) => {
  const { animation, speed } = useSkeleton();
  const duration = SPEED_VAL[speed];

  const shapeClass = circle || pill ? "rounded-full" : "rounded-md";

  // Base classes: fill uses --sk-base CSS var (auto dark-mode), overflow hidden to clip shimmer
  const baseClass = cn(
    "bg-(--sk-base) relative overflow-hidden",
    shapeClass, width, height, className,
  );

  if (animation === "shimmer") {
    return (
      <div
        role="status"
        aria-label="Loading…"
        aria-busy="true"
        className={baseClass}
        style={style}
        {...props}
      >
        {/* data-speed drives --sk-dur via CSS selector in globals.css */}
        <div className="sk-shimmer absolute inset-0" data-speed={speed} />
      </div>
    );
  }

  if (animation === "pulse") {
    return (
      <motion.div
        role="status"
        aria-label="Loading…"
        aria-busy="true"
        className={baseClass}
        style={style}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{
          repeat: Infinity,
          duration: parseFloat(duration) * 0.85,
          ease: "easeInOut",
        }}
        // Forward HTML div attributes (onClick, data-*, etc.)
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      />
    );
  }

  // animation === "none": static placeholder, no movement
  return (
    <div
      role="status"
      aria-label="Loading…"
      aria-busy="true"
      className={baseClass}
      style={style}
      {...props}
    />
  );
};

// ── SkeletonFade — crossfade from skeleton → real content ─────────────────────

export interface SkeletonFadeProps {
  /** While true the skeleton is visible; once false it crossfades to children */
  loading: boolean;
  /** The skeleton UI to show during loading */
  skeleton: React.ReactNode;
  /** The real content revealed after loading */
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps real content and shows a skeleton placeholder while data is loading.
 * Uses AnimatePresence for a smooth crossfade so layout never shifts.
 *
 * @example
 * <SkeletonFade loading={isLoading} skeleton={<SkeletonCard />}>
 *   <ProductCard product={data} />
 * </SkeletonFade>
 */
export const SkeletonFade: React.FC<SkeletonFadeProps> = ({
  loading,
  skeleton,
  children,
  className,
}) => (
  <div className={cn("relative", className)}>
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── 1. Text skeleton ──────────────────────────────────────────────────────────

export interface SkeletonTextProps {
  /** Number of lines to render. Default: 3. */
  lines?: number;
  /**
   * Per-line width override. If omitted, widths follow a natural-looking
   * pattern where the last line is narrower than the rest.
   * Pass an array of Tailwind classes, e.g. ["w-full", "w-5/6", "w-2/3"].
   */
  widths?: string[];
  /** Line height class. Default: "h-3.5". */
  lineHeight?: string;
  className?: string;
}

/**
 * Block of shimmer text lines with varying widths for realism.
 *
 * @example
 * <SkeletonText lines={4} />
 * <SkeletonText lines={2} widths={["w-full", "w-1/2"]} />
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  widths,
  lineHeight = "h-3.5",
  className,
}) => {
  // Default width pattern: full width for all but the last line
  const DEFAULT_WIDTHS = ["w-full", "w-5/6", "w-3/4", "w-2/3", "w-1/2"];

  function lineWidth(i: number) {
    if (widths) return widths[i] ?? widths[widths.length - 1];
    if (i === lines - 1 && lines > 1) return DEFAULT_WIDTHS[Math.min(lines - 1, DEFAULT_WIDTHS.length - 1)];
    return "w-full";
  }

  return (
    <div
      role="status"
      aria-label="Loading text…"
      aria-busy="true"
      className={cn("space-y-2", className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={lineHeight} width={lineWidth(i)} />
      ))}
    </div>
  );
};

// ── 2. Avatar skeleton ────────────────────────────────────────────────────────

export interface SkeletonAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const AVATAR_SIZE: Record<NonNullable<SkeletonAvatarProps["size"]>, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
};

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = "md",
  className,
}) => <Skeleton circle className={cn(AVATAR_SIZE[size], className)} />;

// ── 3. Card skeleton ──────────────────────────────────────────────────────────

export interface SkeletonCardProps {
  /** Show image placeholder at the top. Default: true. */
  hasImage?: boolean;
  /**
   * Tailwind aspect-ratio class for the image area.
   * Default: "aspect-video" (16/9). Use "aspect-square" for product cards.
   */
  imageAspect?: string;
  /** Number of text body lines. Default: 3. */
  bodyLines?: number;
  /** Show action button placeholders at the bottom. Default: true. */
  hasActions?: boolean;
  className?: string;
}

/**
 * Card skeleton that precisely mirrors the structure of the real Card component:
 * image → heading → body text → action buttons.
 *
 * @example
 * <SkeletonCard hasImage imageAspect="aspect-square" />
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageAspect = "aspect-video",
  bodyLines = 3,
  hasActions = true,
  className,
}) => (
  <div
    role="status"
    aria-label="Loading card…"
    aria-busy="true"
    className={cn(
      "rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden",
      className,
    )}
  >
    {hasImage && (
      <Skeleton className={cn("rounded-none w-full", imageAspect)} />
    )}
    <div className="p-5 space-y-3">
      {/* Title */}
      <Skeleton height="h-5" width="w-2/3" />
      {/* Subtitle */}
      <Skeleton height="h-3.5" width="w-1/3" />
      {/* Body */}
      <SkeletonText lines={bodyLines} className="pt-1" />
      {hasActions && (
        <div className="flex gap-3 pt-2">
          <Skeleton height="h-9" width="w-28" />
          <Skeleton height="h-9" width="w-20" />
        </div>
      )}
    </div>
  </div>
);

// ── 4. Table skeleton ─────────────────────────────────────────────────────────

export interface SkeletonTableProps {
  /** Data rows. Default: 5. */
  rows?: number;
  /** Columns (including the first identifier column). Default: 4. */
  cols?: number;
  /** Show a sticky header row. Default: true. */
  hasHeader?: boolean;
  className?: string;
}

/**
 * Skeleton for data tables. The first column is always wider to mimic a label/ID.
 *
 * @example
 * {isLoading && <SkeletonTable rows={8} cols={5} />}
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 4,
  hasHeader = true,
  className,
}) => {
  // --sk-cols drives grid-template-columns in .sk-table-grid (globals.css)
  // The first column is 1.5× wider to mimic an ID/label column.
  const gridVars = { "--sk-cols": cols } as React.CSSProperties;

  return (
    <div
      role="status"
      aria-label="Loading table…"
      aria-busy="true"
      className={cn("space-y-0 overflow-hidden rounded-lg border border-(--color-border)", className)}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className="sk-table-grid px-4 py-3 bg-(--color-surface-muted) border-b border-(--color-border)"
          style={gridVars}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="h-3.5" width={c === 0 ? "w-3/4" : "w-2/3"} />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={cn(
            "sk-table-grid px-4 py-3 border-b border-(--color-border) last:border-b-0",
            r % 2 === 1 && "bg-(--color-bg-subtle)",
          )}
          style={gridVars}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              height="h-3.5"
              width={c === 0 ? "w-full" : c === cols - 1 ? "w-1/2" : "w-5/6"}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ── 5. List skeleton ──────────────────────────────────────────────────────────

export interface SkeletonListProps {
  /** Number of list items. Default: 4. */
  items?: number;
  /** Show circular avatar on the left. Default: true. */
  hasAvatar?: boolean;
  /** Avatar size passed to SkeletonAvatar. Default: "md". */
  avatarSize?: SkeletonAvatarProps["size"];
  /** Show an action placeholder on the right edge. Default: false. */
  hasAction?: boolean;
  /** Show a divider between items. Default: true. */
  hasDivider?: boolean;
  className?: string;
}

/**
 * Skeleton for list views (notifications, search results, contacts, etc.).
 *
 * @example
 * <SkeletonList items={6} hasAction />
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 4,
  hasAvatar = true,
  avatarSize = "md",
  hasAction = false,
  hasDivider = true,
  className,
}) => {
  // Pre-compute width variation so items look naturally different
  const widthVariants = ["w-3/4", "w-2/3", "w-5/6", "w-1/2", "w-4/5"];
  const subWidths = ["w-1/2", "w-1/3", "w-2/5", "w-1/4", "w-2/5"];

  return (
    <div
      role="status"
      aria-label="Loading list…"
      aria-busy="true"
      className={cn("space-y-0", className)}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 py-3",
            hasDivider && i < items - 1 && "border-b border-(--color-border-subtle)",
          )}
        >
          {hasAvatar && (
            <SkeletonAvatar size={avatarSize} className="shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton height="h-3.5" width={widthVariants[i % widthVariants.length]} />
            <Skeleton height="h-3" width={subWidths[i % subWidths.length]} />
          </div>
          {hasAction && (
            <Skeleton height="h-7" width="w-16" className="shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
};

// ── 6. Chart skeleton ─────────────────────────────────────────────────────────

export interface SkeletonChartProps {
  /** Number of bars. Default: 7. */
  bars?: number;
  /**
   * Chart container height class. Default: "h-48".
   * The bars fill this height proportionally.
   */
  height?: string;
  /** Show X-axis labels below bars. Default: true. */
  hasXLabels?: boolean;
  /** Show Y-axis labels on the left. Default: true. */
  hasYAxis?: boolean;
  className?: string;
}

/**
 * Bar-chart shaped skeleton — preserves the exact space of a real chart.
 *
 * @example
 * <SkeletonChart bars={12} height="h-64" />
 */
export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  bars = 7,
  height = "h-48",
  hasXLabels = true,
  hasYAxis = true,
  className,
}) => {
  // Deterministic heights that look like real data (avoid randomness for SSR)
  const BAR_HEIGHTS = [62, 85, 45, 92, 70, 55, 80, 38, 75, 60, 90, 50];

  return (
    <div
      role="status"
      aria-label="Loading chart…"
      aria-busy="true"
      className={cn("space-y-2", className)}
    >
      <div className="flex gap-2">
        {/* Y-axis labels */}
        {hasYAxis && (
          <div className={cn("flex flex-col justify-between pb-1", height)}>
            {[1, 0.75, 0.5, 0.25, 0].map((v) => (
              <Skeleton key={v} height="h-2.5" width="w-6" />
            ))}
          </div>
        )}

        {/* Bars */}
        <div className={cn("flex items-end gap-1.5 flex-1", height)}>
          {Array.from({ length: bars }).map((_, i) => {
            const pct = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
            return (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md rounded-b-none"
                style={{ height: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      {hasXLabels && (
        <div className={cn("flex gap-1.5", hasYAxis && "pl-10")}>
          {Array.from({ length: bars }).map((_, i) => (
            <Skeleton key={i} height="h-2.5" className="flex-1" />
          ))}
        </div>
      )}
    </div>
  );
};

// ── 7. Form skeleton ──────────────────────────────────────────────────────────

export interface SkeletonFormProps {
  /** Number of input fields. Default: 3. */
  fields?: number;
  /**
   * Per-field type override. Determines the height of each input placeholder.
   * - "input"    → h-10  (single-line text, select)
   * - "textarea" → h-24  (multiline)
   * - "checkbox" → h-5 beside a short label
   */
  fieldTypes?: Array<"input" | "textarea" | "checkbox">;
  /** Show submit / cancel button placeholders. Default: true. */
  hasSubmit?: boolean;
  className?: string;
}

const FIELD_HEIGHT: Record<"input" | "textarea" | "checkbox", string> = {
  input:    "h-10",
  textarea: "h-24",
  checkbox: "h-5",
};

/**
 * Form skeleton that replicates label + input field layout.
 *
 * @example
 * <SkeletonForm fields={4} fieldTypes={["input","input","textarea","input"]} />
 */
export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 3,
  fieldTypes,
  hasSubmit = true,
  className,
}) => (
  <div
    role="status"
    aria-label="Loading form…"
    aria-busy="true"
    className={cn("space-y-5", className)}
  >
    {Array.from({ length: fields }).map((_, i) => {
      const type = fieldTypes?.[i] ?? "input";
      return (
        <div key={i} className="space-y-1.5">
          {/* Label */}
          <Skeleton height="h-3.5" width="w-28" />

          {type === "checkbox" ? (
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded" />
              <Skeleton height="h-3.5" width="w-36" />
            </div>
          ) : (
            /* Input / Textarea */
            <Skeleton height={FIELD_HEIGHT[type]} width="w-full" />
          )}
        </div>
      );
    })}

    {hasSubmit && (
      <div className="flex gap-3 pt-1">
        <Skeleton height="h-10" width="w-32" />
        <Skeleton height="h-10" width="w-24" pill />
      </div>
    )}
  </div>
);
