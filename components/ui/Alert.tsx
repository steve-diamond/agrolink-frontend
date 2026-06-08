"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Icons (inline SVG, zero deps) ────────────────────────────────────────────

const icons = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

const styles = {
  info:    "bg-[var(--color-info-bg)]    border-[var(--color-info-border)]    text-[var(--color-info-text)]",
  success: "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-text)]",
  warning: "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]",
  error:   "bg-[var(--color-error-bg)]   border-[var(--color-error-border)]   text-[var(--color-error-text)]",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag"
  > {
  /** Visual and semantic intent */
  variant?: keyof typeof styles;
  /** Alert heading */
  title?: string;
  /** Override the default icon */
  icon?: React.ReactNode;
  /** Show a dismiss (×) button */
  dismissible?: boolean;
  /** Called when the alert is dismissed */
  onDismiss?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Banner-style feedback component.  Optionally dismissible with an animated
 * exit.  Renders `role="alert"` for screen-reader announcements.
 *
 * @example
 * <Alert variant="success" title="Payment received" dismissible onDismiss={close}>
 *   Your order has been placed successfully.
 * </Alert>
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(true);

    const handleDismiss = () => {
      setVisible(false);
      onDismiss?.();
    };

    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              ref={ref}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className={cn(
                "flex gap-3 rounded-lg border p-4 text-sm",
                styles[variant],
                className
              )}
              {...props}
            >
              {/* Icon */}
              <span className="shrink-0 mt-0.5">
                {icon ?? icons[variant]}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <p className="font-semibold mb-0.5">{title}</p>
                )}
                {children && (
                  <div className="opacity-90">{children}</div>
                )}
              </div>

              {/* Dismiss button */}
              {dismissible && (
                <button
                  type="button"
                  aria-label="Dismiss alert"
                  onClick={handleDismiss}
                  className="shrink-0 -mt-0.5 -mr-1 rounded p-1 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Alert.displayName = "Alert";
