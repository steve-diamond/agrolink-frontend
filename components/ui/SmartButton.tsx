"use client";

import * as React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type Variants,
} from "framer-motion";
import { buttonVariants } from "./Button";
import type { ButtonProps } from "./Button";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

/** All states a SmartButton can be in. */
export type SmartButtonStatus = "idle" | "loading" | "success" | "error";

interface RippleEntry {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface SmartButtonProps
  extends Omit<
    ButtonProps,
    // Override these with SmartButton-specific versions below
    "loading" | "onClick" | "leadingIcon" | "trailingIcon"
  > {
  /**
   * Async action handler (auto mode).
   * Resolving → "success" state; throwing → "error" state.
   * If omitted, fall back to `onClick`.
   */
  onAction?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;

  /**
   * External status override (controlled mode).
   * When set, the component doesn't manage status internally.
   */
  status?: SmartButtonStatus;

  /** Regular onClick for non-async actions. Ripple + haptic still fire. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;

  /** Text/icon shown while loading. Defaults to a spinner only. */
  loadingLabel?: React.ReactNode;
  /** Text/icon shown on success. Default: "Done". */
  successLabel?: React.ReactNode;
  /** Text/icon shown on error. Default: "Failed". */
  errorLabel?: React.ReactNode;

  /**
   * Milliseconds before reverting from success/error → idle.
   * Default: 2000.
   */
  revertAfter?: number;

  /**
   * Fire navigator.vibrate(10) on mobile tap (if supported).
   * Default: true.
   */
  haptic?: boolean;

  /** Suppress the ripple effect. Default: false. */
  noRipple?: boolean;
}

// ── Ripple colour per button variant ─────────────────────────────────────────

function rippleColor(variant: SmartButtonProps["variant"]): string {
  switch (variant) {
    case "ghost":
    case "outline":
      return "rgba(22,163,74,0.18)"; // primary green at low opacity
    default:
      return "rgba(255,255,255,0.28)"; // white works on all dark bg variants
  }
}

// ── Inline SVG icons (no external import) ────────────────────────────────────

/** Animated rotating spinner */
const SpinnerIcon: React.FC = () => (
  <motion.svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="31.416"
      strokeDashoffset="12"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </motion.svg>
);

/** Animated checkmark — draws in on mount */
const CheckIcon: React.FC = () => (
  <motion.svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.polyline points="20 6 9 17 4 12" />
  </motion.svg>
);

/** Animated X — scales in on mount */
const XIcon: React.FC = () => (
  <motion.svg
    className="size-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden
    initial={{ scale: 0, rotate: -45 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 18 }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </motion.svg>
);

// ── State content animation variants ────────────────────────────────────────

const CONTENT_VARIANTS: Variants = {
  initial: { opacity: 0, y: 6,  scale: 0.92 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -5, scale: 0.92, transition: { duration: 0.1,  ease: "easeIn" } },
};

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for Button with five micro-interaction layers:
 *
 * 1. **Ripple** — material-design expanding circle from the exact pointer position.
 * 2. **Haptic** — navigator.vibrate(10) on mobile, if the device supports it.
 * 3. **Loading** — spinner replaces content; button width stays fixed.
 * 4. **Success** — animated checkmark + green background; auto-reverts.
 * 5. **Error shake** — horizontal shake + red flash; auto-reverts.
 *
 * **Auto mode** (recommended):
 * ```tsx
 * <SmartButton onAction={async () => { await saveData(); }}>
 *   Save
 * </SmartButton>
 * ```
 *
 * **Controlled mode**:
 * ```tsx
 * <SmartButton status={status} onClick={handleClick}>
 *   Submit
 * </SmartButton>
 * ```
 */
export const SmartButton = React.forwardRef<HTMLButtonElement, SmartButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      children,
      leadingIcon,
      trailingIcon,
      onAction,
      status: externalStatus,
      onClick,
      loadingLabel,
      successLabel = "Done",
      errorLabel = "Failed",
      revertAfter = 2000,
      haptic = true,
      noRipple = false,
      disabled,
      ...rest
    },
    ref,
  ) => {
    // ── State ────────────────────────────────────────────────────────────────
    const [internalStatus, setInternalStatus] = useState<SmartButtonStatus>("idle");
    const [ripples, setRipples] = useState<RippleEntry[]>([]);

    // Framer Motion controls — used exclusively for the error shake
    const shakeControls = useAnimationControls();

    // Track mounted state + pending revert timer to prevent setState after unmount
    const mountedRef   = useRef(true);
    const revertTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The effective status is external (controlled) or internal (auto)
    const currentStatus = externalStatus ?? internalStatus;
    const isDisabled    = disabled || currentStatus === "loading" || currentStatus === "success";

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
        if (revertTimer.current) clearTimeout(revertTimer.current);
      };
    }, []);

    // ── Error shake ──────────────────────────────────────────────────────────
    useEffect(() => {
      if (currentStatus === "error") {
        shakeControls.start({
          x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
          transition: { duration: 0.5, ease: "easeInOut" },
        });
      }
    }, [currentStatus, shakeControls]);

    // ── Ripple ───────────────────────────────────────────────────────────────
    const addRipple = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (noRipple || isDisabled) return;
        const el   = e.currentTarget as HTMLButtonElement;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x    = e.clientX - rect.left - size / 2;
        const y    = e.clientY - rect.top  - size / 2;
        const id   = Date.now() + Math.random(); // unique within same ms
        setRipples((prev) => [
          ...prev,
          { id, x, y, size, color: rippleColor(variant) },
        ]);
        setTimeout(
          () => setRipples((prev) => prev.filter((r) => r.id !== id)),
          700,
        );
      },
      [noRipple, isDisabled, variant],
    );

    // ── Interaction handlers ─────────────────────────────────────────────────
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        // Haptic feedback (mobile, best-effort)
        if (
          haptic &&
          typeof navigator !== "undefined" &&
          typeof navigator.vibrate === "function"
        ) {
          try { navigator.vibrate(10); } catch { /* device may deny */ }
        }
        addRipple(e);
      },
      [haptic, addRipple],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);

        // Auto mode: only runs when onAction is provided and status is uncontrolled
        if (!onAction || externalStatus !== undefined) return;
        if (revertTimer.current) clearTimeout(revertTimer.current);

        setInternalStatus("loading");

        onAction(e)
          .then(() => {
            if (!mountedRef.current) return;
            setInternalStatus("success");
            revertTimer.current = setTimeout(() => {
              if (mountedRef.current) setInternalStatus("idle");
            }, revertAfter);
          })
          .catch(() => {
            if (!mountedRef.current) return;
            setInternalStatus("error");
            revertTimer.current = setTimeout(() => {
              if (mountedRef.current) setInternalStatus("idle");
            }, revertAfter);
          });
      },
      [onClick, onAction, externalStatus, revertAfter],
    );

    // ── Derived display properties ────────────────────────────────────────────
    // Background changes via the variant system — no extra CSS needed
    const effectiveVariant: ButtonProps["variant"] =
      currentStatus === "success" ? "success" :
      currentStatus === "error"   ? "danger"  :
      variant;

    // CSS animation class that fires once when entering a state
    const flashClass =
      currentStatus === "loading" ? "btn-loading-pulse" :
      currentStatus === "success" ? "btn-success-burst" :
      currentStatus === "error"   ? "btn-error-flash"   :
      "";

    return (
      <motion.button
        ref={ref}
        // Shake animation applied via controls; hover/tap run independently
        animate={shakeControls}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled   ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          buttonVariants({ variant: effectiveVariant, size, fullWidth }),
          // Required for ripple clipping and absolute-positioned state content
          "relative overflow-hidden",
          currentStatus === "loading" && "cursor-wait",
          flashClass,
          className,
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={currentStatus === "loading"}
        aria-live="polite"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        {...rest}
      >
        {/* ── Ripples ──────────────────────────────────────────────────────── *
         * Absolutely positioned, clipped by overflow-hidden on the button.    */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="btn-ripple"
            // Dynamic pointer coordinates — CSS custom properties on the element
            // are the only mechanism to pass runtime values to pure CSS animations.
            // eslint-disable-next-line react/forbid-component-props
            style={{
              "--ripple-x":     `${r.x}px`,
              "--ripple-y":     `${r.y}px`,
              "--ripple-size":  `${r.size}px`,
              "--ripple-color": r.color,
            } as React.CSSProperties}
          />
        ))}

        {/* ── Width anchor ─────────────────────────────────────────────────── *
         * Invisible copy of the idle content. Always rendered so the button   *
         * width never collapses when swapping to loading/success/error icons. */}
        <span
          className="invisible inline-flex items-center gap-2 select-none"
          aria-hidden="true"
        >
          {leadingIcon}
          {children}
          {trailingIcon}
        </span>

        {/* ── Visible state content ─────────────────────────────────────────── *
         * AnimatePresence cross-fades between state layers.                    */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentStatus}
            variants={CONTENT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center gap-2"
          >
            {currentStatus === "idle" && (
              <>
                {leadingIcon}
                <span>{children}</span>
                {trailingIcon}
              </>
            )}

            {currentStatus === "loading" && (
              <>
                <SpinnerIcon />
                {loadingLabel && <span>{loadingLabel}</span>}
              </>
            )}

            {currentStatus === "success" && (
              <>
                <CheckIcon />
                {successLabel && <span>{successLabel}</span>}
              </>
            )}

            {currentStatus === "error" && (
              <>
                <XIcon />
                {errorLabel && <span>{errorLabel}</span>}
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  },
);

SmartButton.displayName = "SmartButton";
