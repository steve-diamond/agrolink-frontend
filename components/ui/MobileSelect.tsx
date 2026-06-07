"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Icons ──────────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4 shrink-0 text-(--color-fg-muted)">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function XIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden className={small ? "h-3 w-3" : "h-4 w-4"}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4 shrink-0 text-primary-600">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Shared types ──────────────────────────────────────────────────────────────

export interface MobileSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// ── Detect touch/mobile (used for native-select fallback) ─────────────────────

function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    setMobile(
      window.matchMedia("(max-width: 640px)").matches ||
        ("ontouchstart" in window && navigator.maxTouchPoints > 1)
    );
  }, []);
  return mobile;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. MobileSelect — single-value select with search (custom desktop, native mobile)
// ════════════════════════════════════════════════════════════════════════════

export interface MobileSelectProps {
  options: MobileSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  id?: string;
  /** Force native select even on desktop */
  forceNative?: boolean;
}

export function MobileSelect({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  label,
  placeholder = "Select…",
  helperText,
  error,
  searchable = true,
  disabled,
  required,
  fullWidth = false,
  id: idProp,
  forceNative = false,
}: MobileSelectProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descId = `${id}-desc`;
  const isMobile = useIsMobile();
  const useNative = forceNative || isMobile;

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? (valueProp ?? "") : internalValue;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === currentValue);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.group?.toLowerCase().includes(q)
    );
  }, [options, query]);

  // Grouped options for dropdown display
  const grouped = React.useMemo(() => {
    const map = new Map<string, MobileSelectOption[]>();
    filtered.forEach((o) => {
      const key = o.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [filtered]);

  const select = (opt: MobileSelectOption) => {
    if (opt.disabled) return;
    if (!isControlled) setInternalValue(opt.value);
    onChange?.(opt.value);
    setOpen(false);
    setQuery("");
    navigator.vibrate?.(6);
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search on open
  React.useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // ── Native select (mobile) ──────────────────────────────────────────────
  if (useNative) {
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-(--color-fg-subtle) select-none">
            {label}
            {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            value={currentValue}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error || helperText ? descId : undefined}
            onChange={(e) => {
              if (!isControlled) setInternalValue(e.target.value);
              onChange?.(e.target.value);
            }}
            className={cn(
              "w-full appearance-none rounded-xl border bg-(--color-surface) text-(--color-fg)",
              "min-h-11 px-4 pr-10 text-base",
              "[-webkit-tap-highlight-color:transparent]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500"
                : "border-(--color-border) hover:border-primary-400"
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {[...grouped.entries()].map(([group, items]) =>
              group ? (
                <optgroup key={group} label={group}>
                  {items.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.disabled}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                items.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              )
            )}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--color-fg-muted)">
            <ChevronIcon open={false} />
          </span>
        </div>
        {error ? (
          <p id={descId} role="alert" className="text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p id={descId} className="text-xs text-(--color-fg-muted)">{helperText}</p>
        ) : null}
      </div>
    );
  }

  // ── Custom dropdown (desktop) ───────────────────────────────────────────
  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-(--color-fg-subtle) select-none">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-describedby={error || helperText ? descId : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-(--color-surface)",
          "min-h-11 px-4 text-base text-left",
          "[-webkit-tap-highlight-color:transparent]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "border-primary-500 ring-2 ring-primary-500 ring-offset-1"
            : error
            ? "border-red-500"
            : "border-(--color-border) hover:border-primary-400"
        )}
      >
        <span className={selectedOption ? "text-(--color-fg)" : "text-(--color-fg-muted)"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1",
            "rounded-xl border border-(--color-border) bg-(--color-surface)",
            "shadow-xl overflow-hidden",
            "animate-slide-down"
          )}
        >
          {/* Search */}
          {searchable && (
            <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
              <SearchIcon />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-(--color-fg) placeholder:text-(--color-fg-muted) focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-(--color-fg-muted) hover:text-(--color-fg)">
                  <XIcon small />
                </button>
              )}
            </div>
          )}

          {/* Options */}
          <div role="listbox" aria-label={label} className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-(--color-fg-muted)">No results</div>
            ) : (
              [...grouped.entries()].map(([group, items]) => (
                <React.Fragment key={group}>
                  {group && (
                    <div aria-hidden className="px-3 pt-2 pb-0.5 text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)">
                      {group}
                    </div>
                  )}
                  {items.map((o) => (
                    <div
                      key={o.value}
                      role="option"
                      aria-selected={o.value === currentValue ? "true" : "false"}
                      aria-disabled={o.disabled ? "true" : undefined}
                      onClick={() => select(o)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm",
                        "select-none [-webkit-tap-highlight-color:transparent]",
                        "transition-colors duration-100",
                        o.disabled
                          ? "cursor-not-allowed opacity-40"
                          : o.value === currentValue
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "hover:bg-slate-50 text-(--color-fg)"
                      )}
                    >
                      {o.label}
                      {o.value === currentValue && <CheckIcon />}
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}

        {error ? (
          <p id={descId} role="alert" className="text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p id={descId} className="text-xs text-(--color-fg-muted)">{helperText}</p>
        ) : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. MobileMultiSelect — multi-value select with chip/tag display
// ════════════════════════════════════════════════════════════════════════════

export interface MobileMultiSelectProps {
  options: MobileSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  maxSelected?: number;
  id?: string;
}

export function MobileMultiSelect({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  label,
  placeholder = "Select…",
  helperText,
  error,
  searchable = true,
  disabled,
  required,
  fullWidth = false,
  maxSelected,
  id: idProp,
}: MobileMultiSelectProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descId = `${id}-desc`;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const isControlled = valueProp !== undefined;
  const [internalValues, setInternalValues] = React.useState<string[]>(defaultValue ?? []);
  const currentValues = isControlled ? (valueProp ?? []) : internalValues;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (opt: MobileSelectOption) => {
    if (opt.disabled) return;
    const already = currentValues.includes(opt.value);
    let next: string[];
    if (already) {
      next = currentValues.filter((v) => v !== opt.value);
    } else {
      if (maxSelected && currentValues.length >= maxSelected) return;
      next = [...currentValues, opt.value];
    }
    if (!isControlled) setInternalValues(next);
    onChange?.(next);
    navigator.vibrate?.(6);
  };

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = currentValues.filter((v) => v !== val);
    if (!isControlled) setInternalValues(next);
    onChange?.(next);
    navigator.vibrate?.(6);
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  React.useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open, searchable]);

  const selectedLabels = currentValues
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as MobileSelectOption[];

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-(--color-fg-subtle) select-none"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}

      {/* Trigger with chips */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-describedby={error || helperText ? descId : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5 rounded-xl border bg-(--color-surface) text-left",
          "min-h-11 px-3 py-2",
          "[-webkit-tap-highlight-color:transparent]",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "border-primary-500 ring-2 ring-primary-500 ring-offset-1"
            : error
            ? "border-red-500"
            : "border-(--color-border) hover:border-primary-400"
        )}
      >
        {/* Chips */}
        {selectedLabels.map((o) => (
          <span
            key={o.value}
            className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700"
          >
            {o.label}
            <span
              role="button"
              aria-label={`Remove ${o.label}`}
              onClick={(e) => removeChip(o.value, e)}
              className="rounded-full hover:bg-primary-200 p-0.5 transition-colors cursor-pointer"
            >
              <XIcon small />
            </span>
          </span>
        ))}

        {/* Placeholder */}
        {selectedLabels.length === 0 && (
          <span className="text-sm text-(--color-fg-muted)">{placeholder}</span>
        )}

        {/* Chevron pushed right */}
        <span className="ml-auto shrink-0 text-(--color-fg-muted)">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          aria-label={label}
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1",
            "rounded-xl border border-(--color-border) bg-(--color-surface)",
            "shadow-xl overflow-hidden animate-slide-down"
          )}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
              <SearchIcon />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoComplete="off"
                className="flex-1 bg-transparent text-sm text-(--color-fg) placeholder:text-(--color-fg-muted) focus:outline-none"
              />
            </div>
          )}

          {/* Max selection warning */}
          {maxSelected && currentValues.length >= maxSelected && (
            <p className="px-4 py-2 text-xs text-amber-600 bg-amber-50">
              Maximum {maxSelected} selections reached
            </p>
          )}

          <div role="listbox" aria-multiselectable="true" aria-label={label} className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-(--color-fg-muted)">No results</div>
            ) : (
              filteredOptions.map((o) => {
                const checked = currentValues.includes(o.value);
                const disabled = o.disabled || (!!maxSelected && !checked && currentValues.length >= maxSelected);
                return (
                  <div
                    key={o.value}
                    role="option"
                    aria-selected={checked ? "true" : "false"}
                    aria-disabled={disabled ? "true" : undefined}
                    onClick={() => toggle(o)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm",
                      "select-none [-webkit-tap-highlight-color:transparent] transition-colors",
                      disabled
                        ? "cursor-not-allowed opacity-40"
                        : checked
                        ? "bg-primary-50"
                        : "hover:bg-slate-50"
                    )}
                  >
                    {/* Checkbox visual */}
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        checked
                          ? "border-primary-600 bg-primary-600"
                          : "border-slate-400"
                      )}
                    >
                      {checked && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3 w-3">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </span>
                    <span className={checked ? "font-medium text-primary-700" : "text-(--color-fg)"}>
                      {o.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <p id={descId} role="alert" className="text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p id={descId} className="text-xs text-(--color-fg-muted)">{helperText}</p>
      ) : null}
    </div>
  );
}
