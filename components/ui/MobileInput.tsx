"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Icons (inline SVGs — no extra dep) ───────────────────────────────────────

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden className="h-4 w-4">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4 text-emerald-500">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MobileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  /** Validation error — shown inline below the field */
  error?: string;
  /** Show green checkmark when the field has a valid value */
  success?: boolean;
  /** Max length for character counter display */
  maxLength?: number;
  /** Icon rendered inside the left edge */
  leadingIcon?: React.ReactNode;
  /** If true, show the clear (X) button when the field has a value */
  clearable?: boolean;
  /** Called when the clear button is pressed */
  onClear?: () => void;
  /** Visual size */
  size?: "md" | "lg";
  /** Stretch to fill container */
  fullWidth?: boolean;
  /** Validate inline on blur — called to produce an error message */
  validate?: (value: string) => string | undefined;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  function MobileInput(
    {
      className,
      label,
      helperText,
      error: errorProp,
      success: successProp,
      maxLength,
      leadingIcon,
      clearable = false,
      onClear,
      size = "lg",
      fullWidth = false,
      id: idProp,
      type = "text",
      required,
      disabled,
      value,
      defaultValue,
      validate,
      onBlur,
      onChange,
      autoCapitalize,
      autoComplete,
      ...props
    },
    ref
  ) {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const descId = `${id}-desc`;

    // ── Controlled / uncontrolled value tracking ──────────────────────────
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(
      (defaultValue as string) ?? ""
    );
    const currentValue = isControlled ? (value as string) : internalValue;

    // ── Password visibility toggle ────────────────────────────────────────
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    // ── Inline blur validation ────────────────────────────────────────────
    const [blurError, setBlurError] = React.useState<string | undefined>();
    const error = errorProp ?? blurError;
    const success = successProp ?? (!error && currentValue.length > 0 && Boolean(validate));

    // ── Smart mobile defaults ─────────────────────────────────────────────
    const smartAutoCapitalize =
      autoCapitalize ??
      (type === "email" || type === "url" || type === "password" ? "none" : "sentences");
    const smartAutoComplete =
      autoComplete ??
      (type === "email" ? "email" : type === "tel" ? "tel" : undefined);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      if (blurError) setBlurError(undefined); // clear inline error on retype
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (validate) setBlurError(validate(e.target.value));
      onBlur?.(e);
    };

    const handleClear = () => {
      if (!isControlled) setInternalValue("");
      onClear?.();
      // Create a synthetic change event so form libraries can react
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(input, "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      navigator.vibrate?.(6);
    };

    const togglePassword = () => {
      setShowPassword((v) => !v);
      navigator.vibrate?.(6);
    };

    // ── Derived state ──────────────────────────────────────────────────────
    const hasError = Boolean(error);
    const charCount = currentValue.length;
    const nearLimit = maxLength ? charCount >= maxLength * 0.85 : false;
    const atLimit = maxLength ? charCount >= maxLength : false;

    // Right-side slot width logic
    const hasRightSlot = isPassword || (clearable && currentValue.length > 0) || success;

    // ── Size tokens ────────────────────────────────────────────────────────
    const heightClass = size === "lg" ? "min-h-11 py-2.5" : "min-h-11 py-2";
    const textClass = size === "lg" ? "text-base" : "text-sm";

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-(--color-fg-subtle) select-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden>*</span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Leading icon */}
          {leadingIcon && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 flex items-center text-(--color-fg-muted)"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            value={isControlled ? value : internalValue}
            defaultValue={isControlled ? undefined : defaultValue}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            autoCapitalize={smartAutoCapitalize}
            autoComplete={smartAutoComplete}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={error || helperText ? descId : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              // Base
              "w-full rounded-xl border bg-(--color-surface) text-(--color-fg)",
              "px-4 placeholder:text-(--color-fg-muted)",
              // Size
              heightClass, textClass,
              // Touch: transparent tap highlight
              "[-webkit-tap-highlight-color:transparent]",
              // Transitions
              "transition-all duration-150",
              // Focus ring
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Border states
              hasError
                ? "border-red-500 bg-red-50/30"
                : success
                ? "border-emerald-500 bg-emerald-50/20"
                : "border-(--color-border) hover:border-primary-400",
              // Leading padding
              leadingIcon && "pl-10",
              // Trailing padding
              hasRightSlot && "pr-20",
              className
            )}
            {...props}
          />

          {/* Right slot: success check / clear / password toggle */}
          <span className="absolute right-2 flex items-center gap-0.5">
            {/* Success checkmark */}
            {success && !hasError && (
              <span className="animate-field-success flex items-center">
                <CheckIcon />
              </span>
            )}

            {/* Clear button */}
            {clearable && currentValue.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear field"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  "text-(--color-fg-muted) hover:bg-slate-100 hover:text-(--color-fg)",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  "active:scale-90"
                )}
              >
                <XIcon />
              </button>
            )}

            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  "text-(--color-fg-muted) hover:bg-slate-100 hover:text-(--color-fg)",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  "active:scale-90"
                )}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            )}
          </span>
        </div>

        {/* Footer row: error/helper left, char count right */}
        <div className="flex items-start justify-between gap-2">
          {/* Error / helper */}
          {hasError ? (
            <p id={descId} role="alert" className="text-xs leading-snug animate-field-error text-red-600">
              {error}
            </p>
          ) : (
            <p id={descId} className="text-xs leading-snug text-(--color-fg-muted)">
              {helperText ?? ""}
            </p>
          )}

          {/* Character counter */}
          {maxLength && (
            <p
              aria-live="polite"
              className={cn(
                "shrink-0 text-xs tabular-nums",
                atLimit
                  ? "font-semibold text-red-600"
                  : nearLimit
                  ? "text-amber-600"
                  : "text-(--color-fg-muted)"
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";
