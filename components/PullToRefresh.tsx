"use client";

/**
 * PullToRefresh
 *
 * A mobile-first pull-to-refresh wrapper that works with both window scroll
 * and any custom scroll container. Only activates on mobile/tablet viewports.
 *
 * Usage:
 *   <PullToRefresh onRefresh={fetchData}>
 *     <YourList />
 *   </PullToRefresh>
 *
 *   // With a custom scroll container:
 *   <PullToRefresh onRefresh={fetchData} scrollRef={myScrollRef}>
 *     <div ref={myScrollRef} className="overflow-y-auto h-screen">
 *       <YourList />
 *     </div>
 *   </PullToRefresh>
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

// ── Constants ────────────────────────────────────────────────────────────────

/** Pull distance (px) that triggers a refresh */
const THRESHOLD = 80;
/** Maximum visual pull distance (px) — content won't translate further */
const MAX_PULL = 120;
/** Height of the spinner/indicator panel (px) */
const INDICATOR_H = 56;
/** Resistance factor — lower = more elastic resistance */
const RESISTANCE = 0.45;
/** Minimum touch y-delta (px) to start tracking (avoids horizontal swipes) */
const MIN_START_DELTA = 8;

// ── Types ────────────────────────────────────────────────────────────────────

type ToastState = { type: "success" | "error"; message: string } | null;

export interface PullToRefreshProps {
  /** Async function that fetches fresh data. Should throw on error. */
  onRefresh: () => Promise<void>;
  children: ReactNode;
  /**
   * Ref to a custom scroll container element.
   * When omitted, window.scrollY is used to detect "at the top".
   */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Custom success message shown in the toast (default: "Updated") */
  successMessage?: string;
  /** Custom error message shown in the toast (default: "Failed to refresh") */
  errorMessage?: string;
  /** Disable on desktop (lg+). Default: true */
  mobileOnly?: boolean;
}

// ── Spinner SVG ──────────────────────────────────────────────────────────────

function Spinner({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`size-6 text-green-600 ${spinning ? "animate-spin" : ""}`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset={spinning ? "0" : "31.4"}
        style={{
          transformOrigin: "center",
          transition: spinning ? "none" : "stroke-dashoffset 0.25s ease",
        }}
      />
    </svg>
  );
}

/** Arrow icon that rotates based on pull progress */
function PullArrow({ progress }: { progress: number }) {
  const rotate = Math.min(progress, 1) * 180;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 text-green-600"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.1s linear" }}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

// ── Inline toast banner ──────────────────────────────────────────────────────

function ToastBanner({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDone, 2500);
    return () => clearTimeout(id);
  }, [toast, onDone]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-16 left-1/2 -translate-x-1/2 z-60
        flex items-center gap-2
        px-4 py-2 rounded-full text-sm font-semibold shadow-lg
        animate-fade-in-down
        ${isSuccess
          ? "bg-green-600 text-white"
          : "bg-red-500 text-white"
        }
      `}
    >
      {isSuccess ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      {toast.message}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PullToRefresh({
  onRefresh,
  children,
  scrollRef,
  successMessage = "Updated",
  errorMessage = "Failed to refresh. Try again.",
  mobileOnly = true,
}: PullToRefreshProps) {
  // Visual pull distance (0 → MAX_PULL) — drives the CSS transform
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Refs for gesture tracking (no re-render during drag)
  const startYRef = useRef(0);
  const currentPullRef = useRef(0);
  const isDraggingRef = useRef(false);
  const thresholdHapticFiredRef = useRef(false);
  const transitioning = useRef(false);

  const dismissToast = useCallback(() => setToast(null), []);

  /** True when the container (or window) is scrolled to the top */
  const isAtTop = useCallback((): boolean => {
    if (scrollRef?.current) return scrollRef.current.scrollTop <= 0;
    return window.scrollY <= 0;
  }, [scrollRef]);

  const haptic = useCallback((duration: number) => {
    try {
      if ("vibrate" in navigator) navigator.vibrate(duration);
    } catch { /* ignore */ }
  }, []);

  /** Snap the indicator back and run the refresh callback */
  const triggerRefresh = useCallback(async () => {
    if (refreshing || transitioning.current) return;
    transitioning.current = true;
    haptic(12);
    setRefreshing(true);
    // Hold spinner at threshold height while refreshing
    setPullY(THRESHOLD);

    try {
      await onRefresh();
      setToast({ type: "success", message: successMessage });
    } catch {
      setToast({ type: "error", message: errorMessage });
    } finally {
      setRefreshing(false);
      setPullY(0);
      currentPullRef.current = 0;
      transitioning.current = false;
    }
  }, [refreshing, onRefresh, successMessage, errorMessage, haptic]);

  /** Cancel pull without refreshing */
  const cancelPull = useCallback(() => {
    isDraggingRef.current = false;
    thresholdHapticFiredRef.current = false;
    currentPullRef.current = 0;
    setPullY(0);
  }, []);

  useEffect(() => {
    // Skip gesture setup on desktop when mobileOnly is true
    if (mobileOnly && typeof window !== "undefined" && window.innerWidth >= 1024) {
      return;
    }

    const getScrollTarget = (): EventTarget =>
      scrollRef?.current ?? window;

    const onTouchStart = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (!isAtTop()) return;
      startYRef.current = touch.clientY;
      isDraggingRef.current = true;
      thresholdHapticFiredRef.current = false;
    };

    const onTouchMove = (e: Event) => {
      if (!isDraggingRef.current || refreshing || transitioning.current) return;

      const touch = (e as TouchEvent).touches[0];
      const rawDelta = touch.clientY - startYRef.current;

      if (rawDelta < MIN_START_DELTA) return;

      // We're pulling down — prevent native scroll/bounce
      (e as TouchEvent).preventDefault();

      if (!isAtTop()) {
        cancelPull();
        return;
      }

      // Apply rubber-band resistance
      const elastic = Math.min(rawDelta * RESISTANCE, MAX_PULL);
      currentPullRef.current = elastic;
      setPullY(elastic);

      // Fire haptic once when threshold crossed
      if (elastic >= THRESHOLD && !thresholdHapticFiredRef.current) {
        thresholdHapticFiredRef.current = true;
        haptic(20);
      }
    };

    const onTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (currentPullRef.current >= THRESHOLD) {
        void triggerRefresh();
      } else {
        cancelPull();
      }
    };

    const target = getScrollTarget();

    // touchmove must be non-passive so we can call preventDefault
    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: false });
    target.addEventListener("touchend", onTouchEnd, { passive: true });
    target.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
      target.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    mobileOnly,
    scrollRef,
    refreshing,
    isAtTop,
    haptic,
    triggerRefresh,
    cancelPull,
  ]);

  // Progress ratio (0 → 1) for the pull arrow rotation
  const progress = Math.min(pullY / THRESHOLD, 1);
  // Whether the content/indicator should animate back (not mid-drag)
  const shouldTransition = !isDraggingRef.current;

  const springStyle = (extraY: number = 0) => ({
    transform: `translateY(${pullY + extraY}px)`,
    transition: shouldTransition
      ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)"
      : "none",
    willChange: "transform" as const,
  });

  return (
    <div className="relative" style={{ overscrollBehaviorY: "contain" }}>
      {/* ── Pull indicator panel ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
        style={{
          top: 0,
          height: `${INDICATOR_H}px`,
          transform: `translateY(${pullY - INDICATOR_H}px)`,
          transition: shouldTransition
            ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)"
            : "none",
          willChange: "transform",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {refreshing ? (
            <Spinner spinning />
          ) : (
            <>
              <PullArrow progress={progress} />
              {pullY > 12 && (
                <span className="text-[10px] font-semibold text-green-600 leading-none">
                  {progress >= 1 ? "Release to refresh" : "Pull to refresh"}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Content wrapper — shifts down as you pull ───────────────────── */}
      <div style={springStyle()}>
        {children}
      </div>

      {/* ── Toast notification ──────────────────────────────────────────── */}
      <ToastBanner toast={toast} onDone={dismissToast} />
    </div>
  );
}
