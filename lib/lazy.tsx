"use client";

/**
 * lib/lazy.tsx
 *
 * Utilities for code-splitting and deferred loading.
 *
 *  - LazyComponent   : Suspense + error-boundary wrapper for dynamically
 *                       imported components.
 *  - createDynamic   : Opinionated wrapper around next/dynamic that wires up
 *                       a skeleton loader and error boundary automatically.
 */

import React, {
  Suspense,
  Component,
  type ComponentType,
  type ReactNode,
} from "react";
import dynamic, { type DynamicOptions } from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ChunkErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    if (process.env.NODE_ENV !== "production") {
      console.error("[LazyComponent] Chunk load error:", error);
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">
              Failed to load this section.
            </p>
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ─── LazyComponent ────────────────────────────────────────────────────────────

export interface LazyComponentProps {
  /** The content to render once loaded. */
  children: ReactNode;
  /**
   * Skeleton fallback shown while the chunk is loading.
   * Defaults to a single shimmering bar (height configurable via className).
   */
  fallback?: ReactNode;
  /** Optional custom error UI. Overrides the built-in retry card. */
  errorFallback?: ReactNode;
  /** Called when the chunk errors. Use for error reporting. */
  onError?: (error: Error) => void;
  /** Extra classes applied to the outer wrapper div. */
  className?: string;
}

/**
 * Wrap any `next/dynamic` component to get automatic Suspense + error
 * boundary handling with consistent skeletons.
 *
 * @example
 * ```tsx
 * const HeavyChart = dynamic(() => import("./HeavyChart"), { ssr: false });
 *
 * <LazyComponent fallback={<SkeletonChart />}>
 *   <HeavyChart data={data} />
 * </LazyComponent>
 * ```
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  errorFallback,
  onError,
  className,
}) => {
  const defaultFallback = (
    <Skeleton className={`h-40 w-full rounded-xl ${className ?? ""}`} />
  );

  return (
    <ChunkErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback ?? defaultFallback}>
        {children}
      </Suspense>
    </ChunkErrorBoundary>
  );
};

// ─── createDynamic ────────────────────────────────────────────────────────────

/**
 * Thin wrapper around `next/dynamic` that:
 *  1. Disables SSR by default (safe for client-only libs like chart.js).
 *  2. Accepts an optional `loadingFallback` ReactNode.
 *  3. Returns the dynamic component ready to use — you still need to wrap it
 *     in `<LazyComponent>` for error-boundary coverage.
 *
 * @example
 * ```ts
 * const LazyBarChart = createDynamic(
 *   () => import("@/components/charts/AdminBarChart"),
 *   { ssr: false }
 * );
 * ```
 */
export function createDynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: Omit<DynamicOptions<P>, "loader">
) {
  return dynamic<P>(loader, {
    ssr: false,
    ...options,
  });
}
