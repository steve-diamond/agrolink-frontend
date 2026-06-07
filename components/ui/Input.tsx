"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visible label text */
  label?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Validation error message (replaces helperText, sets aria-invalid) */
  error?: string;
  /** Icon or element rendered on the left inside the input */
  leadingIcon?: React.ReactNode;
  /** Icon or element rendered on the right inside the input */
  trailingIcon?: React.ReactNode;
  /** Visual size preset */
  size?: "sm" | "md" | "lg";
  /** Stretch to fill container */
  fullWidth?: boolean;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: "h-8  px-3 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

const iconPadding = {
  leadingSm: "pl-8",  leadingMd: "pl-9",  leadingLg: "pl-11",
  trailingSm: "pr-8", trailingMd: "pr-9", trailingLg: "pr-11",
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Accessible text input with label, helper text, error state, and icon slots.
 * Forwards the ref to the underlying `<input>` element.
 *
 * @example
 * <Input
 *   label="Farm Name"
 *   placeholder="e.g. Green Acres"
 *   leadingIcon={<FaLeaf />}
 *   error={errors.farmName?.message}
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      size = "md",
      fullWidth = false,
      id: idProp,
      type = "text",
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const id = idProp ?? React.useId();
    const descId = `${id}-desc`;
    const hasError = Boolean(error);

    const leadKey = `leading${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof iconPadding;
    const trailKey = `trailing${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof iconPadding;

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-(--color-fg-subtle)"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-error-500" aria-hidden>*</span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Leading icon */}
          {leadingIcon && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-3 flex items-center text-(--color-fg-placeholder)",
                size === "lg" ? "left-4" : "left-3"
              )}
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            required={required}
            disabled={disabled}
            aria-describedby={error || helperText ? descId : undefined}
            className={cn(
              "w-full rounded-md border bg-(--color-surface) text-(--color-fg)",
              "placeholder:text-(--color-fg-placeholder)",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              sizeClasses[size],
              leadingIcon && iconPadding[leadKey],
              trailingIcon && iconPadding[trailKey],
              hasError
                ? "border-(--color-error-border) focus-visible:ring-error-500"
                : "border-(--color-border) hover:border-primary-400",
              className
            )}
            {...props}
          />

          {/* Trailing icon */}
          {trailingIcon && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute right-3 flex items-center text-(--color-fg-placeholder)",
                size === "lg" ? "right-4" : "right-3"
              )}
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Helper / error text */}
        {(error || helperText) && (
          <p
            id={descId}
            className={cn(
              "text-xs",
              hasError ? "text-(--color-error-text)" : "text-(--color-fg-muted)"
            )}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
