import { useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Shortcut {
  /** The key value (e.g. "Escape", "ArrowDown", "/", "k") */
  key: string;
  /** Require Ctrl (or Cmd on Mac) to be held */
  ctrl?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Require Alt */
  alt?: boolean;
  /**
   * When true the shortcut is suppressed while a text input, textarea, or
   * contenteditable element has focus — prevents hijacking typing.
   * Defaults to `false`.
   */
  noInputFocus?: boolean;
  handler: (event: KeyboardEvent) => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el.isContentEditable
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Register declarative global keyboard shortcuts.
 * Shortcuts are cleaned up automatically on unmount or when `shortcuts` changes.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: "/",      noInputFocus: true, handler: () => searchRef.current?.focus() },
 *   { key: "Escape",                     handler: () => setOpen(false) },
 *   { key: "k",     ctrl: true,          handler: () => openCommandPalette() },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  // Keep a stable ref so we don't re-register on every render
  const shortcutsRef = useRef<Shortcut[]>(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcutsRef.current) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          noInputFocus = false,
          handler,
        } = s;

        if (noInputFocus && isEditableTarget(e.target)) continue;

        const ctrlMatch = ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
        const altMatch = alt ? e.altKey : !e.altKey;

        if (e.key === key && ctrlMatch && shiftMatch && altMatch) {
          handler(e);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []); // empty deps — we use the ref for latest shortcuts
}
