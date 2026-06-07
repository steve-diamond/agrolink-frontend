"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccordionItem {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single" allows only one open at a time; "multiple" allows many */
  type?: "single" | "multiple";
  /** Default open values (uncontrolled) */
  defaultValue?: string | string[];
  /** Controlled open values */
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
  /** Style variant */
  variant?: "default" | "bordered" | "separated";
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Accessible accordion with animated expand/collapse.
 * Supports single or multi-open modes and three visual variants.
 *
 * @example
 * <Accordion
 *   type="single"
 *   defaultValue="faq-1"
 *   items={[
 *     { value: "faq-1", trigger: "What is AgroLink?", content: <p>...</p> },
 *     { value: "faq-2", trigger: "How do I sell?",    content: <p>...</p> },
 *   ]}
 * />
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = "single",
  defaultValue,
  value: controlledValue,
  onChange,
  className,
  variant = "default",
}) => {
  const normalise = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const [internal, setInternal] = React.useState<string[]>(
    normalise(defaultValue)
  );

  const open = controlledValue !== undefined ? normalise(controlledValue) : internal;

  const toggle = (val: string) => {
    let next: string[];
    if (open.includes(val)) {
      next = open.filter((v) => v !== val);
    } else {
      next = type === "single" ? [val] : [...open, val];
    }
    setInternal(next);
    onChange?.(type === "single" ? (next[0] ?? "") : next);
  };

  // ── Variant wrappers ────────────────────────────────────────────────────────
  const rootClass = cn(
    variant === "default"   && "divide-y divide-[var(--color-border)]",
    variant === "bordered"  && "border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]",
    variant === "separated" && "flex flex-col gap-3",
    className
  );

  const itemClass = (isOpen: boolean) =>
    cn(
      variant === "separated" && [
        "border border-[var(--color-border)] rounded-xl overflow-hidden",
        isOpen && "ring-1 ring-primary-500",
      ]
    );

  const triggerClass = (isDisabled: boolean) =>
    cn(
      "flex w-full items-center justify-between gap-4",
      "px-4 py-4 text-left text-sm font-semibold text-[var(--color-fg)]",
      "transition-colors hover:bg-gray-50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
      isDisabled && "opacity-40 cursor-not-allowed pointer-events-none"
    );

  const panelClass = "px-4 pb-5 text-sm text-[var(--color-fg-muted)]";

  return (
    <div className={rootClass}>
      {items.map((item) => {
        const isOpen = open.includes(item.value);
        return (
          <div key={item.value} className={itemClass(isOpen)}>
            {/* Trigger */}
            <button
              type="button"
              role="button"
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.value}`}
              id={`accordion-trigger-${item.value}`}
              disabled={item.disabled}
              onClick={() => !item.disabled && toggle(item.value)}
              className={triggerClass(!!item.disabled)}
            >
              <span>{item.trigger}</span>
              {/* Animated chevron */}
              <motion.svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5 shrink-0 text-[var(--color-fg-muted)]"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </motion.svg>
            </button>

            {/* Animated panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={`accordion-panel-${item.value}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${item.value}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className={panelClass}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
