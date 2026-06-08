"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label text */
  label?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Validation error (replaces helperText, sets aria-invalid) */
  error?: string;
  /** Grow in height as content is typed */
  autoResize?: boolean;
  /** Show a character counter (requires `maxLength` to be set) */
  showCount?: boolean;
  /** Stretch to fill container */
  fullWidth?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Accessible multi-line text input with optional auto-resize and character
 * counter.  Forwards the ref to the underlying `<textarea>` element.
 *
 * @example
 * <Textarea
 *   label="Product Description"
 *   autoResize
 *   maxLength={500}
 *   showCount
 *   error={errors.description?.message}
 * />
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className, label, helperText, error, autoResize = false,
      showCount = false, fullWidth = false,
      id: idProp, required, disabled, maxLength, onChange, ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const descId = `${id}-desc`;
    const hasError = Boolean(error);
    const [length, setLength] = React.useState(
      typeof props.value === "string"
        ? props.value.length
        : typeof props.defaultValue === "string"
          ? props.defaultValue.length
          : 0
    );

    // Internal ref for auto-resize (merged with forwarded ref)
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    // Resize on mount
    React.useEffect(resize, [resize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize();
      setLength(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={id} className="text-sm font-medium text-[var(--color-fg-subtle)]">
              {label}
              {required && <span className="ml-0.5 text-error-500" aria-hidden>*</span>}
            </label>
            {showCount && maxLength && (
              <span
                aria-live="polite"
                className={cn(
                  "text-xs tabular-nums",
                  length >= maxLength
                    ? "text-[var(--color-error-text)]"
                    : "text-[var(--color-fg-muted)]"
                )}
              >
                {length}/{maxLength}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={mergedRef}
          id={id}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={error || helperText ? descId : undefined}
          aria-required={required}
          onChange={handleChange}
          rows={props.rows ?? 4}
          className={cn(
            "w-full rounded-md border bg-[var(--color-surface)] px-3 py-2",
            "text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-placeholder)]",
            "transition-colors duration-150 resize-y",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            autoResize && "resize-none overflow-hidden",
            hasError
              ? "border-[var(--color-error-border)] focus-visible:ring-error-500"
              : "border-[var(--color-border)] hover:border-primary-400",
            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p
            id={descId}
            aria-live={hasError ? "polite" : undefined}
            className={cn("text-xs", hasError ? "text-[var(--color-error-text)]" : "text-[var(--color-fg-muted)]")}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
