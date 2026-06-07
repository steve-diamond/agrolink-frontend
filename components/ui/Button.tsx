"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

// ── Variants ────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles shared by every variant
  [
    "inline-flex items-center justify-center gap-2 font-semibold rounded-md",
    "border border-transparent",
    "transition-all duration-150 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-600 text-white",
          "hover:bg-primary-700 active:bg-primary-800",
          "shadow-sm hover:shadow-md",
        ],
        secondary: [
          "bg-secondary-600 text-white",
          "hover:bg-secondary-700 active:bg-secondary-800",
          "shadow-sm hover:shadow-md",
        ],
        ghost: [
          "bg-transparent text-primary-700",
          "hover:bg-primary-50 active:bg-primary-100",
        ],
        outline: [
          "bg-transparent border-primary-600 text-primary-700",
          "hover:bg-primary-50 active:bg-primary-100",
        ],
        danger: [
          "bg-error-500 text-white",
          "hover:bg-error-700 active:bg-error-900",
          "shadow-sm hover:shadow-md",
        ],
        success: [
          "bg-success-500 text-white",
          "hover:bg-success-700 active:bg-success-900",
          "shadow-sm hover:shadow-md",
        ],
      },
      size: {
        sm: "h-8  px-3   text-xs  gap-1.5",
        md: "h-10 px-4   text-sm  gap-2",
        lg: "h-11 px-5   text-base gap-2",
        xl: "h-13 px-7   text-lg  gap-2.5",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ── Types ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  /** Button label */
  children?: React.ReactNode;
  /** Icon rendered before the label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label */
  trailingIcon?: React.ReactNode;
  /** Show a spinner and disable interaction */
  loading?: boolean;
  /** Expand to fill container width */
  fullWidth?: boolean;
}

// Animated spinner
const Spinner: React.FC = () => (
  <motion.svg
    className="size-4 text-current"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="31.416"
      strokeDashoffset="15"
      strokeLinecap="round"
    />
  </motion.svg>
);

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Versatile button component with six variants, four sizes, loading state,
 * and Framer Motion tap/hover animations.
 *
 * @example
 * <Button variant="primary" size="lg" leadingIcon={<PlusIcon />}>
 *   Add Product
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? <Spinner /> : leadingIcon}
        {children}
        {!loading && trailingIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
