"use client";

/**
 * AccessibilityProvider
 *
 * Manages user-level visual accessibility preferences:
 *   - Reduced motion  (mirrors + overrides OS prefers-reduced-motion)
 *   - High contrast   (mirrors + overrides OS prefers-contrast / forced-colors)
 *   - Font scale      (normal → large → larger)
 *   - Color-blind mode (protanopia / deuteranopia / tritanopia / achromatopsia)
 *
 * Preferences are persisted in localStorage and applied as `data-*` attributes on
 * <html> so pure-CSS rules in globals.css can respond without JS runtime cost.
 *
 * Usage:
 *   const { reducedMotion, setReducedMotion } = useAccessibility();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ColorBlindMode =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export type FontScale = "normal" | "large" | "larger";

export interface AccessibilityPreferences {
  /** Whether all UI animations are suppressed. */
  reducedMotion: boolean;
  /** Whether a high-contrast colour scheme is active. */
  highContrast: boolean;
  /** Body-text size multiplier. */
  fontScale: FontScale;
  /** Active colour-blindness simulation / compensation mode. */
  colorBlindMode: ColorBlindMode;

  setReducedMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setFontScale: (v: FontScale) => void;
  setColorBlindMode: (v: ColorBlindMode) => void;
  /** Reset all overrides back to OS defaults. */
  resetAll: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AccessibilityContext = createContext<AccessibilityPreferences | null>(null);

// ── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = "agrolink-a11y-prefs";

interface StoredPrefs {
  reducedMotion?: boolean;
  highContrast?: boolean;
  fontScale?: FontScale;
  colorBlindMode?: ColorBlindMode;
}

function readStorage(): StoredPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPrefs) : {};
  } catch {
    return {};
  }
}

function writeStorage(patch: Partial<StoredPrefs>) {
  try {
    const current = readStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // Silently fail if storage is unavailable (private mode, quota, etc.)
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialise with neutral defaults; OS detection runs in a useEffect so SSR
  // and client renders stay in sync (no hydration mismatch).
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [fontScale, setFontScaleState] = useState<FontScale>("normal");
  const [colorBlindMode, setColorBlindModeState] =
    useState<ColorBlindMode>("none");

  // ── Bootstrap from OS prefs + persisted user overrides ──────────────────
  useEffect(() => {
    const stored = readStorage();
    const osReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const osHighContrast =
      window.matchMedia("(prefers-contrast: more)").matches ||
      window.matchMedia("(forced-colors: active)").matches;

    setReducedMotionState(stored.reducedMotion ?? osReducedMotion);
    setHighContrastState(stored.highContrast ?? osHighContrast);
    setFontScaleState(stored.fontScale ?? "normal");
    setColorBlindModeState(stored.colorBlindMode ?? "none");
  }, []);

  // ── Sync data-* attributes on <html> ────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.reducedMotion = String(reducedMotion);
    html.dataset.highContrast = String(highContrast);
    html.dataset.fontScale = fontScale;
    html.dataset.colorBlindMode = colorBlindMode;
  }, [reducedMotion, highContrast, fontScale, colorBlindMode]);

  // ── Setters with persistence ─────────────────────────────────────────────
  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
    writeStorage({ reducedMotion: v });
  }, []);

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v);
    writeStorage({ highContrast: v });
  }, []);

  const setFontScale = useCallback((v: FontScale) => {
    setFontScaleState(v);
    writeStorage({ fontScale: v });
  }, []);

  const setColorBlindMode = useCallback((v: ColorBlindMode) => {
    setColorBlindModeState(v);
    writeStorage({ colorBlindMode: v });
  }, []);

  const resetAll = useCallback(() => {
    const osReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const osHighContrast =
      window.matchMedia("(prefers-contrast: more)").matches ||
      window.matchMedia("(forced-colors: active)").matches;

    setReducedMotionState(osReducedMotion);
    setHighContrastState(osHighContrast);
    setFontScaleState("normal");
    setColorBlindModeState("none");

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        highContrast,
        fontScale,
        colorBlindMode,
        setReducedMotion,
        setHighContrast,
        setFontScale,
        setColorBlindMode,
        resetAll,
      }}
    >
      {/* SVG filter definitions for colour-blind simulation/compensation.
          Hidden from the visual tree; referenced by CSS `filter: url(#id)`.
          Matrices sourced from Machado et al. (2009) standard approximations. */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="a11y-svg-filters"
      >
        <defs>
          {/* Protanopia — red-channel insensitivity */}
          <filter id="a11y-filter-protanopia" x="0" y="0" width="100%" height="100%">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0     0 0
                      0.558 0.442 0     0 0
                      0     0.242 0.758 0 0
                      0     0     0     1 0"
            />
          </filter>

          {/* Deuteranopia — green-channel insensitivity */}
          <filter id="a11y-filter-deuteranopia" x="0" y="0" width="100%" height="100%">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0   0 0
                      0.7   0.3   0   0 0
                      0     0.3   0.7 0 0
                      0     0     0   1 0"
            />
          </filter>

          {/* Tritanopia — blue-channel insensitivity */}
          <filter id="a11y-filter-tritanopia" x="0" y="0" width="100%" height="100%">
            <feColorMatrix
              type="matrix"
              values="0.95  0.05  0     0 0
                      0     0.433 0.567 0 0
                      0     0.475 0.525 0 0
                      0     0     0     1 0"
            />
          </filter>
        </defs>
      </svg>

      {children}
    </AccessibilityContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAccessibility(): AccessibilityPreferences {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be called inside <AccessibilityProvider>"
    );
  }
  return ctx;
}
