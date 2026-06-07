"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TabItem {
  /** Unique key */
  value: string;
  /** Tab button label */
  label: React.ReactNode;
  /** Panel content */
  content: React.ReactNode;
  /** Disable this tab */
  disabled?: boolean;
  /** Icon before the label */
  icon?: React.ReactNode;
  /** Badge/count after the label */
  badge?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active tab value */
  value?: string;
  /** Uncontrolled default */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Stack tabs vertically */
  orientation?: "horizontal" | "vertical";
  /** Tab list visual style */
  variant?: "line" | "pills" | "boxed";
  className?: string;
  /** Class for the tab list strip */
  tabListClass?: string;
  /** Class for panel content area */
  panelClass?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Fully accessible tab component with animated indicator, keyboard navigation,
 * horizontal and vertical orientations, and three visual variants.
 *
 * @example
 * <Tabs
 *   defaultValue="overview"
 *   items={[
 *     { value: "overview", label: "Overview", content: <Overview /> },
 *     { value: "pricing",  label: "Pricing",  content: <Pricing /> },
 *   ]}
 * />
 */
export const Tabs: React.FC<TabsProps> = ({
  items,
  value: controlledValue,
  defaultValue,
  onChange,
  orientation = "horizontal",
  variant = "line",
  className,
  tabListClass,
  panelClass,
}) => {
  const [internal, setInternal] = React.useState(
    defaultValue ?? items.find((i) => !i.disabled)?.value ?? ""
  );
  const active = controlledValue !== undefined ? controlledValue : internal;

  const select = (val: string) => {
    setInternal(val);
    onChange?.(val);
  };

  const isVertical = orientation === "vertical";
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const enabled = items.reduce<number[]>((acc, item, i) => {
      if (!item.disabled) acc.push(i);
      return acc;
    }, []);
    const pos = enabled.indexOf(idx);

    const prev = isVertical ? "ArrowUp" : "ArrowLeft";
    const next = isVertical ? "ArrowDown" : "ArrowRight";

    if (e.key === prev && pos > 0) {
      e.preventDefault();
      tabRefs.current[enabled[pos - 1]]?.focus();
    } else if (e.key === next && pos < enabled.length - 1) {
      e.preventDefault();
      tabRefs.current[enabled[pos + 1]]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabRefs.current[enabled[0]]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      tabRefs.current[enabled[enabled.length - 1]]?.focus();
    }
  };

  const listId = React.useId();

  // ── Variant styles ──────────────────────────────────────────────────────────
  const listBase = cn(
    "flex shrink-0",
    isVertical ? "flex-col" : "flex-row",
    variant === "line" && !isVertical && "border-b border-[var(--color-border)]",
    variant === "line" && isVertical  && "border-r border-[var(--color-border)]",
    variant === "boxed" && "bg-gray-100 rounded-lg p-1 gap-1",
    variant === "pills" && "gap-1",
    tabListClass
  );

  const tabBase = (isActive: boolean, isDisabled: boolean) =>
    cn(
      "relative inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
      // Line variant
      variant === "line" && [
        "px-4 py-3 rounded-none",
        isVertical ? "pr-6 pl-0" : "",
        isActive
          ? "text-primary-600"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
      ],
      // Pills variant
      variant === "pills" && [
        "px-4 py-2 rounded-full",
        isActive
          ? "bg-primary-600 text-white"
          : "text-[var(--color-fg-muted)] hover:bg-primary-50 hover:text-primary-700",
      ],
      // Boxed variant
      variant === "boxed" && [
        "px-4 py-2 rounded-md flex-1 justify-center",
        isActive
          ? "bg-white text-[var(--color-fg)] shadow-sm"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
      ]
    );

  return (
    <div
      className={cn("flex", isVertical ? "flex-row gap-0" : "flex-col", className)}
    >
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Tabs"
        aria-orientation={orientation}
        className={listBase}
      >
        {items.map((item, idx) => {
          const isActive = item.value === active;
          return (
            <button
              key={item.value}
              ref={(el) => { tabRefs.current[idx] = el; }}
              role="tab"
              type="button"
              id={`${listId}-tab-${item.value}`}
              aria-controls={`${listId}-panel-${item.value}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => !item.disabled && select(item.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={tabBase(isActive, !!item.disabled)}
            >
              {item.icon}
              {item.label}
              {item.badge}

              {/* Animated underline for "line" variant */}
              {variant === "line" && isActive && (
                <motion.span
                  layoutId={`${listId}-indicator`}
                  className={cn(
                    "absolute bg-primary-600",
                    isVertical
                      ? "right-0 top-0 bottom-0 w-0.5"
                      : "bottom-0 left-0 right-0 h-0.5"
                  )}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className={cn("flex-1 min-w-0", isVertical ? "pl-6" : "pt-5", panelClass)}>
        {items.map((item) => (
          <div
            key={item.value}
            role="tabpanel"
            id={`${listId}-panel-${item.value}`}
            aria-labelledby={`${listId}-tab-${item.value}`}
            tabIndex={0}
            hidden={item.value !== active}
            className="focus-visible:outline-none"
          >
            {item.value === active && item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
