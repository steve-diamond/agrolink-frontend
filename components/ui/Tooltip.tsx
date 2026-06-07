"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Tooltip label */
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  /** Delay before showing (ms) */
  delayShow?: number;
  /** Delay before hiding (ms) */
  delayHide?: number;
  /** Override max-width */
  maxWidth?: number;
  className?: string;
}

// ── Offset map (translate so arrow points at target) ─────────────────────────

const placementStyles: Record<TooltipPlacement, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full  left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2  mr-2",
  right:  "left-full  top-1/2 -translate-y-1/2  ml-2",
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top:    "top-full  left-1/2 -translate-x-1/2 border-t-[var(--tooltip-bg)] border-b-transparent border-l-transparent border-r-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--tooltip-bg)] border-t-transparent border-l-transparent border-r-transparent",
  left:   "left-full  top-1/2  -translate-y-1/2  border-l-[var(--tooltip-bg)] border-r-transparent border-t-transparent border-b-transparent",
  right:  "right-full top-1/2  -translate-y-1/2  border-r-[var(--tooltip-bg)] border-l-transparent border-t-transparent border-b-transparent",
};

const initial: Record<TooltipPlacement, { opacity: number; y?: number; x?: number }> = {
  top:    { opacity: 0, y: 4 },
  bottom: { opacity: 0, y: -4 },
  left:   { opacity: 0, x: 4 },
  right:  { opacity: 0, x: -4 },
};

// ── Component ─────────────────────────────────────────────────────────────────

let _uid = 0;

/**
 * Lightweight tooltip that appears on hover and focus.
 * Wraps any single child element — the trigger must be focusable for keyboard accessibility.
 *
 * @example
 * <Tooltip content="Remove from cart" placement="top">
 *   <button aria-label="Remove"><TrashIcon /></button>
 * </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  delayShow = 300,
  delayHide = 100,
  maxWidth = 220,
  className,
}) => {
  const [visible, setVisible] = React.useState(false);
  const showTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = React.useRef<ReturnType<typeof setTimeout>>();
  const id = React.useRef(`tooltip-${++_uid}`).current;

  const show = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delayShow);
  };
  const hide = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), delayHide);
  };

  // Inject ARIA props onto child
  const child = React.cloneElement(children, {
    "aria-describedby": visible ? id : undefined,
    onMouseEnter: (e: React.MouseEvent) => { children.props.onMouseEnter?.(e); show(); },
    onMouseLeave: (e: React.MouseEvent) => { children.props.onMouseLeave?.(e); hide(); },
    onFocus:      (e: React.FocusEvent)  => { children.props.onFocus?.(e);      show(); },
    onBlur:       (e: React.FocusEvent)  => { children.props.onBlur?.(e);       hide(); },
  });

  return (
    <span className="relative inline-flex">
      {child}
      <AnimatePresence>
        {visible && (
          <motion.div
            id={id}
            role="tooltip"
            style={{ maxWidth, "--tooltip-bg": "#1f2937" } as React.CSSProperties}
            initial={initial[placement]}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={initial[placement]}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[var(--z-tooltip)] pointer-events-none",
              "rounded-md px-3 py-1.5 text-xs font-medium text-white",
              "bg-gray-800 dark:bg-gray-900 shadow-lg",
              placementStyles[placement],
              className
            )}
          >
            {content}
            {/* Arrow */}
            <span
              aria-hidden
              className={cn(
                "absolute size-0 border-4",
                arrowStyles[placement]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
