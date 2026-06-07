"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPosition = "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center";

export interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  /** ms before auto-dismiss; set to 0 to disable */
  duration?: number;
  /** Dismiss button */
  dismissible?: boolean;
  icon?: React.ReactNode;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, string> = {
  info:    "border-l-4 border-l-accent-500  bg-[var(--color-surface)] text-[var(--color-fg)]",
  success: "border-l-4 border-l-success     bg-[var(--color-surface)] text-[var(--color-fg)]",
  warning: "border-l-4 border-l-warning     bg-[var(--color-surface)] text-[var(--color-fg)]",
  error:   "border-l-4 border-l-error       bg-[var(--color-surface)] text-[var(--color-fg)]",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-accent-500 shrink-0 mt-0.5" aria-hidden>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-success shrink-0 mt-0.5" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-warning shrink-0 mt-0.5" aria-hidden>
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-error shrink-0 mt-0.5" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

const positionClasses: Record<ToastPosition, string> = {
  "top-right":     "top-4 right-4 items-end",
  "top-left":      "top-4 left-4  items-start",
  "top-center":    "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right":  "bottom-4 right-4 items-end",
  "bottom-left":   "bottom-4 left-4  items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

const isBottom = (p: ToastPosition) => p.startsWith("bottom");

// ── Single toast item ─────────────────────────────────────────────────────────

const ToastCard: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
  position: ToastPosition;
}> = ({ item, onDismiss, position }) => {
  const { id, variant = "info", title, message, duration = 4000, dismissible = true, icon } = item;

  React.useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  const bottom = isBottom(position);

  return (
    <motion.div
      layout
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "flex items-start gap-3 w-80 max-w-[90vw] rounded-lg border border-[var(--color-border)]",
        "shadow-[var(--shadow-lg)] px-4 py-3 text-sm",
        variantStyles[variant]
      )}
    >
      {icon ?? variantIcons[variant]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="text-[var(--color-fg-muted)]">{message}</p>
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(id)}
          className="shrink-0 -mr-1 rounded p-1 text-[var(--color-fg-muted)] opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

// ── Provider ──────────────────────────────────────────────────────────────────

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  /** Maximum toasts rendered simultaneously */
  maxToasts?: number;
}

/**
 * Wraps your app (or a subtree) to enable the `useToast()` hook.
 * Renders the toast portal itself — no separate `<Toaster>` needed.
 *
 * @example
 * // In your root layout:
 * <ToastProvider position="top-right">
 *   {children}
 * </ToastProvider>
 *
 * // In any component:
 * const { toast } = useToast();
 * toast({ variant: "success", title: "Saved!", message: "Your changes were saved." });
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
}) => {
  const [queue, setQueue] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((opts: Omit<ToastItem, "id">): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setQueue((q) => {
      const next = [...q, { ...opts, id }];
      return next.length > maxToasts ? next.slice(next.length - maxToasts) : next;
    });
    return id;
  }, [maxToasts]);

  const dismiss = React.useCallback((id: string) => {
    setQueue((q) => q.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => setQueue([]), []);

  const bottom = isBottom(position);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <div
        aria-label="Notifications"
        className={cn(
          "fixed z-[var(--z-toast)] flex flex-col pointer-events-none",
          bottom ? "flex-col-reverse" : "flex-col",
          "gap-2",
          positionClasses[position]
        )}
      >
        <AnimatePresence mode="popLayout">
          {queue.map((item) => (
            <div key={item.id} className="pointer-events-auto">
              <ToastCard item={item} onDismiss={dismiss} position={position} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
