"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// ── Native Select ─────────────────────────────────────────────────────────────

export interface NativeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "h-8  px-3 pr-8 text-xs",
  md: "h-10 px-3 pr-8 text-sm",
  lg: "h-12 px-4 pr-10 text-base",
};

/**
 * Accessible native `<select>` with label, error, and helper text.
 * Use this for straightforward single-value selection.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      className, label, helperText, error, options, placeholder,
      size = "md", fullWidth = false, id: idProp, required, disabled, ...props
    },
    ref
  ) => {
    const id = idProp ?? React.useId();
    const descId = `${id}-desc`;
    const hasError = Boolean(error);

    // Group options
    const grouped = React.useMemo(() => {
      const map = new Map<string, SelectOption[]>();
      options.forEach((o) => {
        const key = o.group ?? "__default__";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(o);
      });
      return map;
    }, [options]);

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--color-fg-subtle)]">
            {label}
            {required && <span className="ml-0.5 text-error-500" aria-hidden>*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error || helperText ? descId : undefined}
            className={cn(
              "w-full appearance-none rounded-md border bg-[var(--color-surface)] text-[var(--color-fg)]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              hasError
                ? "border-[var(--color-error-border)]"
                : "border-[var(--color-border)] hover:border-primary-400",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {[...grouped.entries()].map(([group, items]) =>
              group === "__default__" ? (
                items.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              ) : (
                <optgroup key={group} label={group}>
                  {items.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.disabled}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>

          {/* Chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-placeholder)]" aria-hidden>
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>

        {(error || helperText) && (
          <p id={descId} className={cn("text-xs", hasError ? "text-[var(--color-error-text)]" : "text-[var(--color-fg-muted)]")}>
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

// ── Custom Select ─────────────────────────────────────────────────────────────

export interface CustomSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
}

/**
 * Fully custom accessible dropdown built with Framer Motion animations,
 * keyboard navigation (↑↓ Enter Escape), and ARIA `listbox` semantics.
 *
 * @example
 * <CustomSelect
 *   label="Crop Type"
 *   options={cropOptions}
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Select a crop"
 * />
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
  label, helperText, error, options, value: controlledValue,
  defaultValue, onChange, placeholder = "Select…",
  disabled, required, fullWidth, className, id: idProp,
}) => {
  const id = idProp ?? React.useId();
  const listId = `${id}-list`;
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const [focusedIdx, setFocusedIdx] = React.useState(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const selected = options.find((o) => o.value === value);
  const hasError = Boolean(error);
  const enabledOptions = options.filter((o) => !o.disabled);

  const choose = (opt: SelectOption) => {
    if (opt.disabled) return;
    setInternalValue(opt.value);
    onChange?.(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(enabledOptions[focusedIdx]);
        else setOpen(true);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) { setOpen(true); break; }
        setFocusedIdx((i) => Math.min(i + 1, enabledOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        break;
      case "Escape":
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!buttonRef.current?.closest("[data-select-root]")?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[focusedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIdx, open]);

  return (
    <div
      data-select-root
      className={cn("flex flex-col gap-1 relative", fullWidth && "w-full")}
    >
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-fg-subtle)]"
          onClick={() => buttonRef.current?.focus()}
        >
          {label}
          {required && <span className="ml-0.5 text-error-500" aria-hidden>*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={hasError}
        aria-required={required}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between h-10 px-3 w-full rounded-md border",
          "bg-[var(--color-surface)] text-sm text-[var(--color-fg)]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError ? "border-[var(--color-error-border)]" : "border-[var(--color-border)] hover:border-primary-400",
          className
        )}
      >
        <span className={cn(!selected && "text-[var(--color-fg-placeholder)]")}>
          {selected?.label ?? placeholder}
        </span>
        <motion.svg
          viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0 text-[var(--color-fg-placeholder)]" aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${id}-opt-${focusedIdx}`}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute top-full left-0 right-0 z-[var(--z-dropdown)] mt-1",
              "max-h-60 overflow-y-auto rounded-md border border-[var(--color-border)]",
              "bg-[var(--color-surface)] shadow-lg py-1 text-sm",
            )}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const enabledIdx = enabledOptions.indexOf(opt);
              const isFocused = enabledIdx === focusedIdx;
              return (
                <li
                  key={opt.value}
                  id={`${id}-opt-${enabledIdx}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => choose(opt)}
                  onMouseEnter={() => !opt.disabled && setFocusedIdx(enabledIdx)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer select-none",
                    opt.disabled && "opacity-40 cursor-not-allowed",
                    isFocused && !opt.disabled && "bg-primary-50 text-primary-700",
                    isSelected && "font-medium"
                  )}
                >
                  {opt.label}
                  {isSelected && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-primary-600" aria-hidden>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {(error || helperText) && (
        <p className={cn("text-xs", hasError ? "text-[var(--color-error-text)]" : "text-[var(--color-fg-muted)]")}>
          {error ?? helperText}
        </p>
      )}
    </div>
  );
};
