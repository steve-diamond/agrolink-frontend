"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DropdownPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface DropdownMenuItem {
  /** Unique key */
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Visual separator before this item */
  separator?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  /** Custom click handler (value is passed to onSelect too) */
  onClick?: () => void;
}

export interface DropdownMenuProps {
  /** The trigger element */
  trigger: React.ReactElement;
  items: DropdownMenuItem[];
  onSelect?: (value: string) => void;
  placement?: DropdownPlacement;
  className?: string;
  /** Class for the menu panel */
  menuClass?: string;
  /** Minimum panel width */
  minWidth?: number;
}

// ── Placement styles ──────────────────────────────────────────────────────────

const placementClasses: Record<DropdownPlacement, string> = {
  "bottom-start": "top-full left-0 mt-1",
  "bottom-end":   "top-full right-0 mt-1",
  "top-start":    "bottom-full left-0 mb-1",
  "top-end":      "bottom-full right-0 mb-1",
};

const initialVariant = { opacity: 0, scale: 0.95, y: -6 };

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Accessible dropdown menu with full keyboard navigation.
 * Opens on trigger click, closes on Escape / outside click / item select.
 *
 * @example
 * <DropdownMenu
 *   trigger={<Button variant="ghost">Actions ▾</Button>}
 *   items={[
 *     { value: "edit",   label: "Edit",   icon: <PencilIcon /> },
 *     { value: "delete", label: "Delete", icon: <TrashIcon />, destructive: true, separator: true },
 *   ]}
 *   onSelect={(v) => console.log(v)}
 * />
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  onSelect,
  placement = "bottom-start",
  className,
  menuClass,
  minWidth = 180,
}) => {
  const [open, setOpen] = React.useState(false);
  const [focusIdx, setFocusIdx] = React.useState(-1);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const containerId = React.useId();

  const enabledItems = items.filter((i) => !i.disabled);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus management — focus first item when opened
  React.useEffect(() => {
    if (open) setFocusIdx(0);
    else setFocusIdx(-1);
  }, [open]);

  React.useEffect(() => {
    if (open && focusIdx >= 0) {
      const els = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
      els?.[focusIdx]?.focus();
    }
  }, [open, focusIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault(); setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, enabledItems.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Home")      { e.preventDefault(); setFocusIdx(0); }
    if (e.key === "End")       { e.preventDefault(); setFocusIdx(enabledItems.length - 1); }
    if (e.key === "Tab")       { setOpen(false); }
  };

  const selectItem = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onSelect?.(item.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const triggerEl = React.cloneElement(trigger, {
    ref: triggerRef,
    id: `${containerId}-trigger`,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": `${containerId}-menu`,
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((v) => !v);
    },
    onKeyDown: handleKeyDown,
  });

  return (
    <div className={cn("relative inline-flex", className)} onKeyDown={handleKeyDown}>
      {triggerEl}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={initialVariant}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={initialVariant}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[var(--z-dropdown)]",
              placementClasses[placement],
              "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-xl)]",
              "py-1.5",
              menuClass
            )}
            style={{ minWidth }}
          >
            <ul
              ref={menuRef}
              id={`${containerId}-menu`}
              role="menu"
              aria-labelledby={`${containerId}-trigger`}
              className="outline-none"
            >
              {items.map((item) => (
                <React.Fragment key={item.value}>
                  {item.separator && (
                    <li role="separator" className="my-1 border-t border-[var(--color-border)]" />
                  )}
                  <li role="presentation">
                    <button
                      type="button"
                      role="menuitem"
                      aria-disabled={item.disabled}
                      tabIndex={-1}
                      disabled={item.disabled}
                      onClick={() => selectItem(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm rounded-md mx-0.5 transition-colors",
                        "focus:outline-none focus:bg-gray-100",
                        item.disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                        item.destructive
                          ? "text-error hover:bg-red-50 focus:bg-red-50"
                          : "text-[var(--color-fg)] hover:bg-gray-100"
                      )}
                    >
                      {item.icon && (
                        <span className="size-4 shrink-0 text-[var(--color-fg-muted)]">{item.icon}</span>
                      )}
                      {item.label}
                    </button>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
