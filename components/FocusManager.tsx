"use client";

import * as React from "react";

// ── Focus-trap selector (WCAG standard set) ────────────────────────────────────
const FOCUSABLE_SELECTOR = [
  "a[href]:not([tabindex=\"-1\"])",
  "button:not([disabled]):not([tabindex=\"-1\"])",
  "input:not([disabled]):not([tabindex=\"-1\"])",
  "select:not([disabled]):not([tabindex=\"-1\"])",
  "textarea:not([disabled]):not([tabindex=\"-1\"])",
  "[tabindex]:not([tabindex=\"-1\"])",
  "[contenteditable]:not([tabindex=\"-1\"])",
  "details > summary:not([tabindex=\"-1\"])",
].join(",");

// ── useFocusTrap ──────────────────────────────────────────────────────────────

/**
 * Trap Tab/Shift-Tab focus within `containerRef` while `active`.
 * The first focusable element receives focus when the trap activates.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.closest("[inert]") && getComputedStyle(el).display !== "none"
      );

    // Move focus inside on open
    requestAnimationFrame(() => {
      getFocusable()[0]?.focus();
    });

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) { e.preventDefault(); return; }

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [active, containerRef]);
}

// ── useFocusRestore ───────────────────────────────────────────────────────────

/**
 * Records the active element when `active` becomes `true`, then restores
 * focus to it once `active` becomes `false` (e.g. after a modal closes).
 */
export function useFocusRestore(active: boolean) {
  const returnRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (active) {
      returnRef.current = document.activeElement as HTMLElement;
    } else {
      const el = returnRef.current;
      returnRef.current = null;
      // Slight delay to let exit animations finish
      const id = setTimeout(() => el?.focus({ preventScroll: true }), 80);
      return () => clearTimeout(id);
    }
  }, [active]);

  return returnRef;
}

// ── useArrowKeyNav ────────────────────────────────────────────────────────────

/**
 * Provides arrow-key navigation for a list/grid of items.
 *
 * @param containerRef - ref pointing to the list container element
 * @param selector     - CSS selector for focusable items inside the container
 * @param orientation  - "vertical" (default), "horizontal", or "both"
 */
export function useArrowKeyNav(
  containerRef: React.RefObject<HTMLElement | null>,
  selector = "[role='option'],[role='menuitem'],[role='tab'],[role='gridcell'],li button,li a",
  orientation: "vertical" | "horizontal" | "both" = "vertical"
) {
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent) => {
      const isUp    = e.key === "ArrowUp"    && orientation !== "horizontal";
      const isDown  = e.key === "ArrowDown"  && orientation !== "horizontal";
      const isLeft  = e.key === "ArrowLeft"  && orientation !== "vertical";
      const isRight = e.key === "ArrowRight" && orientation !== "vertical";
      if (!isUp && !isDown && !isLeft && !isRight) return;

      const items = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-disabled")
      );
      if (!items.length) return;

      const currentIdx = items.indexOf(document.activeElement as HTMLElement);
      if (currentIdx === -1) return;

      e.preventDefault();
      const next =
        isDown || isRight
          ? Math.min(currentIdx + 1, items.length - 1)
          : Math.max(currentIdx - 1, 0);
      items[next]?.focus();
    };

    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [containerRef, selector, orientation]);
}

// ── FocusManager (global) ─────────────────────────────────────────────────────

export interface FocusManagerProps {
  /**
   * ID of the global search input that should receive focus when "/" is pressed.
   * Leave empty to disable the "/" shortcut.
   */
  searchInputId?: string;
}

/**
 * Global focus manager. Mount once near the root of the app.
 *
 * Responsibilities:
 * - Renders the visually-hidden "Skip to main content" link.
 * - Adds `data-keyboard-nav` to `<html>` while the user navigates with Tab
 *   so CSS can show enhanced focus rings only for keyboard users.
 * - Registers the "/" shortcut to jump to a search input (opt-in).
 *
 * @example
 * // app/layout.tsx
 * <FocusManager searchInputId="global-search" />
 */
export const FocusManager: React.FC<FocusManagerProps> = ({ searchInputId }) => {
  React.useEffect(() => {
    const html = document.documentElement;

    const onMouseDown = () => html.removeAttribute("data-keyboard-nav");
    const onKeyDown = (e: KeyboardEvent) => {
      // Mark keyboard navigation mode
      if (e.key === "Tab") html.setAttribute("data-keyboard-nav", "true");

      // "/" — jump to search (skip if an editable element has focus)
      if (e.key === "/" && searchInputId) {
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active instanceof HTMLSelectElement ||
          (active as HTMLElement)?.isContentEditable
        ) return;
        e.preventDefault();
        const el = document.getElementById(searchInputId);
        el?.focus();
        if (el instanceof HTMLInputElement) el.select();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchInputId]);

  return (
    <>
      <a href="#main-content" className="skip-to-content" tabIndex={0}>
        Skip to main content
      </a>
      <a href="#main-nav" className="skip-to-content" tabIndex={0}>
        Skip to navigation
      </a>
    </>
  );
};
