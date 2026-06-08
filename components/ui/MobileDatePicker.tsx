"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Types ──────────────────────────────────────────────────────────────────

type PickerMode = "date" | "time" | "datetime-local";

export interface QuickPreset {
  label: string;
  getValue: () => string;
}

export interface MobileDatePickerProps {
  /** "date" | "time" | "datetime-local" */
  mode?: PickerMode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  /** Quick-select presets. Defaults to Today/Tomorrow/Next week for "date" mode */
  presets?: QuickPreset[] | false;
}

// ── Date helpers ───────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toISODateTime(d: Date): string {
  // Local datetime-local value: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function getDefaultPresets(mode: PickerMode): QuickPreset[] {
  if (mode === "time") return [];
  const now = new Date();
  if (mode === "date") {
    return [
      { label: "Today", getValue: () => toISODate(now) },
      { label: "Tomorrow", getValue: () => toISODate(addDays(now, 1)) },
      { label: "Next week", getValue: () => toISODate(addDays(now, 7)) },
    ];
  }
  // datetime-local
  return [
    { label: "Now", getValue: () => toISODateTime(now) },
    { label: "Tomorrow", getValue: () => toISODateTime(addDays(now, 1)) },
    { label: "Next week", getValue: () => toISODateTime(addDays(now, 7)) },
  ];
}

function formatDisplay(value: string, mode: PickerMode): string {
  if (!value) return "";
  try {
    if (mode === "time") return value;
    const d = mode === "date" ? new Date(`${value}T00:00:00`) : new Date(value);
    if (isNaN(d.getTime())) return value;
    return mode === "date"
      ? d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })
      : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
        " " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return value;
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export function MobileDatePicker({
  mode = "date",
  value: valueProp,
  defaultValue,
  onChange,
  label,
  helperText,
  error,
  min,
  max,
  required,
  disabled,
  fullWidth = false,
  id: idProp,
  presets,
}: MobileDatePickerProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const descId = `${id}-desc`;
  const nativeRef = React.useRef<HTMLInputElement>(null);

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? (valueProp ?? "") : internalValue;

  const resolvedPresets: QuickPreset[] =
    presets === false
      ? []
      : presets ?? getDefaultPresets(mode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    navigator.vibrate?.(6);
  };

  const applyPreset = (preset: QuickPreset) => {
    const v = preset.getValue();
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    navigator.vibrate?.(8);
    // Also set native input value for browsers that support it
    if (nativeRef.current) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeSetter?.call(nativeRef.current, v);
      nativeRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const hasError = Boolean(error);
  const displayValue = formatDisplay(currentValue, mode);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-fg-subtle)] select-none"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
        </label>
      )}

      {/* Native input — always present (drives the value) */}
      <div className="relative">
        <input
          ref={nativeRef}
          id={id}
          type={mode}
          value={currentValue}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error || helperText ? descId : undefined}
          onChange={handleChange}
          className={cn(
            "w-full rounded-xl border bg-[var(--color-surface)] text-[var(--color-fg)]",
            "min-h-[44px] px-4 py-2.5 text-base",
            "[-webkit-tap-highlight-color:transparent]",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Native date/time inputs have browser-specific styling; normalise a bit
            "[color-scheme:light]",
            hasError
              ? "border-red-500 bg-red-50/30"
              : "border-[var(--color-border)] hover:border-primary-400"
          )}
        />

        {/* Friendly display overlay for browsers that show raw value */}
        {displayValue && mode !== "time" && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-[var(--color-fg)] opacity-0"
          >
            {displayValue}
          </div>
        )}
      </div>

      {/* Quick presets */}
      {resolvedPresets.length > 0 && (
        <div
          role="group"
          aria-label="Quick presets"
          className="flex flex-wrap gap-2"
        >
          {resolvedPresets.map((preset) => {
            const presetValue = preset.getValue();
            const isActive = currentValue === presetValue;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={disabled}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  "min-h-[36px] min-w-[44px]",
                  "[-webkit-tap-highlight-color:transparent]",
                  "transition-all duration-150 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isActive
                    ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-primary-400 hover:bg-primary-50"
                )}
              >
                {preset.label}
              </button>
            );
          })}
          {/* Clear preset */}
          {currentValue && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!isControlled) setInternalValue("");
                onChange?.("");
                navigator.vibrate?.(6);
              }}
              className={cn(
                "rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500",
                "min-h-[36px] min-w-[44px]",
                "[-webkit-tap-highlight-color:transparent]",
                "hover:border-red-400 hover:text-red-600 hover:bg-red-50",
                "transition-all duration-150 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Error / helper */}
      {(error || helperText) && (
        <p
          id={descId}
          role={hasError ? "alert" : undefined}
          className={cn(
            "text-xs leading-snug",
            hasError ? "animate-field-error text-red-600" : "text-[var(--color-fg-muted)]"
          )}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
