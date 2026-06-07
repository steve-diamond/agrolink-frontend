"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// ── Variants ─────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium rounded-full border px-2.5 py-0.5 text-xs leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        success: "bg-success-bg  border-success-border  text-success-text",
        warning: "bg-warning-bg  border-warning-border  text-warning-text",
        error:   "bg-error-bg    border-error-border    text-error-text",
        info:    "bg-accent-50   border-accent-200      text-accent-700",
        neutral: "bg-gray-100    border-gray-200        text-gray-700",
        primary: "bg-primary-100 border-primary-200     text-primary-700",
      },
      size: {
        sm: "text-xs  px-2   py-0.5",
        md: "text-xs  px-2.5 py-0.5",
        lg: "text-sm  px-3   py-1",
      },
      dot: {
        true: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

// ── Dot colours map ───────────────────────────────────────────────────────────

const dotColour: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error:   "bg-error",
  info:    "bg-accent-500",
  neutral: "bg-gray-400",
  primary: "bg-primary-600",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Show a coloured dot indicator before the label */
  dot?: boolean;
  /** Icon rendered inside the badge */
  icon?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Compact status indicator for tagging items with a semantic state.
 *
 * @example
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="error">Rejected</Badge>
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size, dot, icon, children, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      className={cn(badgeVariants({ variant, size, dot }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full shrink-0",
            dotColour[variant ?? "neutral"] ?? "bg-gray-400"
          )}
        />
      )}
      {icon}
      {children}
    </span>
  )
);

Badge.displayName = "Badge";

export { badgeVariants };
