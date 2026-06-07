"use client";

import { useCallback, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

/** Validator function: returns an error string, or undefined if valid */
export type FieldValidator<T = string> = (value: T) => string | undefined;

/** Per-field state */
export interface FieldState {
  value: string;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
}

/** Schema: one validator (or array of validators) per field key */
export type ValidationSchema<T extends Record<string, string>> = {
  [K in keyof T]?: FieldValidator | FieldValidator[];
};

/** Return type of useFormValidation */
export interface UseFormValidationReturn<T extends Record<string, string>> {
  /** Current field states */
  fields: { [K in keyof T]: FieldState };
  /** Set a field's value — marks it dirty */
  setValue: <K extends keyof T>(name: K, value: string) => void;
  /** Blur handler — marks field touched and runs validators */
  handleBlur: <K extends keyof T>(name: K) => void;
  /** Run all validators; scroll to first error; returns true if form is valid */
  handleSubmit: (e?: React.FormEvent) => boolean;
  /** Reset all fields to initial values */
  reset: () => void;
  /** True when all touched fields are valid */
  isValid: boolean;
  /** Convenience: error string for a field (only shown once touched) */
  getError: (name: keyof T) => string | undefined;
  /** Convenience: success state for a field */
  getSuccess: (name: keyof T) => boolean;
}

// ── Built-in validators ────────────────────────────────────────────────────

export const validators = {
  required:
    (msg = "This field is required"): FieldValidator =>
    (v) =>
      v.trim().length === 0 ? msg : undefined,

  minLength:
    (min: number, msg?: string): FieldValidator =>
    (v) =>
      v.length < min ? (msg ?? `Minimum ${min} characters`) : undefined,

  maxLength:
    (max: number, msg?: string): FieldValidator =>
    (v) =>
      v.length > max ? (msg ?? `Maximum ${max} characters`) : undefined,

  email:
    (msg = "Enter a valid email address"): FieldValidator =>
    (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : msg,

  phone:
    (msg = "Enter a valid phone number"): FieldValidator =>
    (v) =>
      /^[+\d\s\-()]{7,15}$/.test(v.trim()) ? undefined : msg,

  numeric:
    (msg = "Must be a number"): FieldValidator =>
    (v) =>
      v.trim() === "" || !isNaN(Number(v)) ? undefined : msg,

  min:
    (minVal: number, msg?: string): FieldValidator =>
    (v) =>
      Number(v) < minVal ? (msg ?? `Minimum value is ${minVal}`) : undefined,

  max:
    (maxVal: number, msg?: string): FieldValidator =>
    (v) =>
      Number(v) > maxVal ? (msg ?? `Maximum value is ${maxVal}`) : undefined,

  pattern:
    (regex: RegExp, msg = "Invalid format"): FieldValidator =>
    (v) =>
      regex.test(v) ? undefined : msg,

  match:
    (getOther: () => string, msg = "Values do not match"): FieldValidator =>
    (v) =>
      v === getOther() ? undefined : msg,
};

// ── Compose validators ─────────────────────────────────────────────────────

function runValidators(value: string, rules: FieldValidator | FieldValidator[]): string | undefined {
  const list = Array.isArray(rules) ? rules : [rules];
  for (const rule of list) {
    const err = rule(value);
    if (err) return err;
  }
  return undefined;
}

// ── Scroll to first error ──────────────────────────────────────────────────

export function scrollToFirstError(containerRef?: React.RefObject<HTMLElement | null>) {
  const root = containerRef?.current ?? document;
  const el = root.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']");
  if (!el) return;

  // Find the associated label or the field itself
  const target = el.closest<HTMLElement>("[data-field-root]") ?? el;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  // Focus the invalid field
  el.focus({ preventScroll: true });
  navigator.vibrate?.([30, 20, 30]);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  schema: ValidationSchema<T> = {}
): UseFormValidationReturn<T> {
  type Fields = { [K in keyof T]: FieldState };

  const buildInitial = useCallback((): Fields => {
    return Object.fromEntries(
      Object.keys(initialValues).map((k) => [
        k,
        { value: initialValues[k as keyof T], error: undefined, touched: false, dirty: false },
      ])
    ) as Fields;
  }, [initialValues]);

  const [fields, setFields] = useState<Fields>(buildInitial);
  // Store initialValues in a ref so reset always uses original
  const initRef = useRef(initialValues);

  const setValue = useCallback(<K extends keyof T>(name: K, value: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        dirty: value !== initRef.current[name],
        // Clear error on retype if already touched
        error: prev[name].touched
          ? runValidators(value, schema[name] ?? [])
          : undefined,
      },
    }));
  }, [schema]);

  const handleBlur = useCallback(<K extends keyof T>(name: K) => {
    setFields((prev) => {
      const v = prev[name].value;
      return {
        ...prev,
        [name]: {
          ...prev[name],
          touched: true,
          error: runValidators(v, schema[name] ?? []),
        },
      };
    });
  }, [schema]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent): boolean => {
      e?.preventDefault();

      // Run all validators and mark everything touched
      let hasError = false;
      setFields((prev) => {
        const next = { ...prev } as Fields;
        for (const key of Object.keys(next) as (keyof T)[]) {
          const err = runValidators(next[key].value, schema[key] ?? []);
          next[key] = { ...next[key], touched: true, error: err };
          if (err) hasError = true;
        }
        return next;
      });

      if (hasError) {
        // Scroll after state update
        setTimeout(() => scrollToFirstError(), 50);
        navigator.vibrate?.([30, 20, 30]);
        return false;
      }

      navigator.vibrate?.(8);
      return true;
    },
    [schema]
  );

  const reset = useCallback(() => {
    setFields(buildInitial());
  }, [buildInitial]);

  const isValid = Object.values(fields).every(
    (f: FieldState) => !f.error
  );

  const getError = (name: keyof T): string | undefined => {
    const f = fields[name];
    return f.touched ? f.error : undefined;
  };

  const getSuccess = (name: keyof T): boolean => {
    const f = fields[name];
    return f.touched && !f.error && f.value.length > 0;
  };

  return { fields, setValue, handleBlur, handleSubmit, reset, isValid, getError, getSuccess };
}
