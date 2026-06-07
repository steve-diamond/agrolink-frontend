/**
 * Tailwind CSS Configuration — DosAgrolink Agricultural Marketplace
 *
 * Design system tokens for the agri-platform UI.
 * Loaded in globals.css via: @config "./tailwind.config.js"
 *
 * @type {import('tailwindcss').Config}
 */

import formsPlugin from "@tailwindcss/forms";
import typographyPlugin from "@tailwindcss/typography";
import aspectRatioPlugin from "@tailwindcss/aspect-ratio";
// @tailwindcss/line-clamp is built into Tailwind v4 core — no plugin needed.

// ---------------------------------------------------------------------------
// Color scale helpers
// ---------------------------------------------------------------------------

/** Primary — Vibrant Green (#16A34A), aligned to Tailwind's green palette */
const primaryGreen = {
  50:  "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a", // ← brand base
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
  950: "#052e16",
};

/** Secondary — Warm Orange (#EA580C), aligned to Tailwind's orange palette */
const secondaryOrange = {
  50:  "#fff7ed",
  100: "#ffedd5",
  200: "#fed7aa",
  300: "#fdba74",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c", // ← brand base
  700: "#c2410c",
  800: "#9a3412",
  900: "#7c2d12",
  950: "#431407",
};

/** Accent — Teal (#0891B2), aligned to Tailwind's cyan palette */
const accentTeal = {
  50:  "#ecfeff",
  100: "#cffafe",
  200: "#a5f3fc",
  300: "#67e8f9",
  400: "#22d3ee",
  500: "#06b6d4",
  600: "#0891b2", // ← brand base
  700: "#0e7490",
  800: "#155e75",
  900: "#164e63",
  950: "#083344",
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // ── Container ─────────────────────────────────────────────────────────────
  // Centred container capped at max-w-7xl (80rem / 1280px)
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT:  "1rem",
        mobile:   "1.25rem",
        tablet:   "1.5rem",
        desktop:  "2rem",
        wide:     "2rem",
      },
      screens: {
        wide: "80rem", // 1280px
      },
    },

    extend: {

      // ── Breakpoints ─────────────────────────────────────────────────────
      // Semantic names that sit alongside Tailwind's default sm/md/lg/xl set.
      // Usage: mobile:flex, tablet:grid-cols-2, desktop:hidden, wide:px-16
      screens: {
        mobile:  "640px",
        tablet:  "768px",
        desktop: "1024px",
        wide:    "1280px",
      },

      // ── Colors ──────────────────────────────────────────────────────────
      colors: {
        primary:   primaryGreen,
        secondary: secondaryOrange,
        accent:    accentTeal,

        // Semantic status colors (DEFAULT + light/dark shades)
        success: {
          DEFAULT: "#10B981",
          50:  "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          400: "#34D399",
          500: "#10B981",
          700: "#047857",
          900: "#064E3B",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          400: "#FBBF24",
          500: "#F59E0B",
          700: "#B45309",
          900: "#78350F",
        },
        error: {
          DEFAULT: "#EF4444",
          50:  "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          400: "#F87171",
          500: "#EF4444",
          700: "#B91C1C",
          900: "#7F1D1D",
        },

        // Agri-specific surface tokens that complement the CSS variables in globals.css
        agri: {
          "earth-50":  "#fdf8f0",
          "earth-100": "#f8f2e3",
          "earth-200": "#efe5cd",
          "earth-300": "#dcccad",
          "earth-500": "#b98734",
          "earth-700": "#8a5e1e",
          "soil-900":  "#3d2408",
          "sky-100":   "#e0f2fe",
          "sky-400":   "#38bdf8",
        },
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        // Use font-heading / font-body utility classes in components
        heading: ['"Plus Jakarta Sans"', "ui-sans-serif", "sans-serif"],
        body:    ["Inter",               "ui-sans-serif", "sans-serif"],
        // Overrides the Tailwind default so Inter is the base sans font
        sans:    ["Inter",               "ui-sans-serif", "system-ui", "sans-serif"],
      },

      fontSize: {
        xs:   ["0.75rem",  { lineHeight: "1rem",    letterSpacing: "0.01em" }],
        sm:   ["0.875rem", { lineHeight: "1.25rem",  letterSpacing: "0.005em" }],
        base: ["1rem",     { lineHeight: "1.5rem" }],
        lg:   ["1.125rem", { lineHeight: "1.75rem" }],
        xl:   ["1.25rem",  { lineHeight: "1.75rem" }],
        "2xl":["1.5rem",   { lineHeight: "2rem" }],
        "3xl":["1.875rem", { lineHeight: "2.25rem" }],
        "4xl":["2.25rem",  { lineHeight: "2.5rem",   letterSpacing: "-0.01em" }],
        "5xl":["3rem",     { lineHeight: "1.1",      letterSpacing: "-0.02em" }],
        "6xl":["3.75rem",  { lineHeight: "1",        letterSpacing: "-0.025em" }],
      },

      lineHeight: {
        tight:   "1.25",
        snug:    "1.375",
        normal:  "1.5",
        relaxed: "1.75",
        loose:   "2",
      },

      fontWeight: {
        normal:    "400",
        medium:    "500",
        semibold:  "600",
        bold:      "700",
        extrabold: "800",
      },

      // ── Spacing ─────────────────────────────────────────────────────────
      // Explicit declaraton of the platform's chosen spacing scale.
      // Mirrors Tailwind's 4px-grid units — confirms intent and keeps the
      // design system self-documenting.
      spacing: {
        4:  "1rem",
        8:  "2rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem",
        40: "10rem",
        48: "12rem",
        64: "16rem",
        80: "20rem",
        96: "24rem",
      },

      maxWidth: {
        container: "80rem",  // 1280px — same as max-w-7xl
        prose:     "68ch",
      },

      // ── Shadows — green-tinted ───────────────────────────────────────────
      boxShadow: {
        sm:         "0 1px 2px 0 rgba(22, 163, 74, 0.06)",
        DEFAULT:    "0 1px 3px 0 rgba(22, 163, 74, 0.10), 0 1px 2px -1px rgba(22, 163, 74, 0.06)",
        md:         "0 4px 6px -1px rgba(22, 163, 74, 0.08), 0 2px 4px -2px rgba(22, 163, 74, 0.05)",
        lg:         "0 10px 15px -3px rgba(22, 163, 74, 0.08), 0 4px 6px -4px rgba(22, 163, 74, 0.04)",
        xl:         "0 20px 25px -5px rgba(22, 163, 74, 0.10), 0 8px 10px -6px rgba(22, 163, 74, 0.04)",
        "2xl":      "0 25px 50px -12px rgba(22, 163, 74, 0.15)",
        "green-glow":"0 0 20px rgba(22, 163, 74, 0.25), 0 0 40px rgba(22, 163, 74, 0.10)",
        "card":     "0 2px 8px -1px rgba(22, 163, 74, 0.07), 0 4px 16px -2px rgba(0, 0, 0, 0.06)",
        inner:      "inset 0 2px 4px 0 rgba(22, 163, 74, 0.05)",
        none:       "none",
      },

      // ── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        none:    "0",
        sm:      "4px",
        DEFAULT: "8px",
        md:      "8px",
        lg:      "12px",
        xl:      "16px",
        "2xl":   "24px",
        "3xl":   "32px",
        full:    "9999px",
      },

      // ── Animations ───────────────────────────────────────────────────────
      animation: {
        "fade-in":      "fadeIn 0.3s ease-in-out both",
        "slide-up":     "slideUp 0.4s ease-out both",
        "pulse":        "agriPulse 2s ease-in-out infinite",
        "shimmer":      "shimmer 2s linear infinite",
        "spin-slow":    "spin 3s linear infinite",
        "bounce-soft":  "bounceSoft 1.2s ease-in-out infinite",
        "slide-in-left":"slideInLeft 0.35s ease-out both",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        agriPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.45" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-5px)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      // ── Gradient backgrounds ─────────────────────────────────────────────
      backgroundImage: {
        "gradient-agri":    "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)",
        "gradient-harvest": "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        "gradient-water":   "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
        "gradient-hero":    "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
        "shimmer-stripe":
          "linear-gradient(90deg, transparent 0%, rgba(22, 163, 74, 0.07) 50%, transparent 100%)",
      },

      // ── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        fast:   "150ms",
        normal: "200ms",
        slow:   "300ms",
        slower: "500ms",
      },

      transitionTimingFunction: {
        smooth:   "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-exp": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
        "out-exp":"cubic-bezier(0.19, 1, 0.22, 1)",
      },

      // ── Grid helpers ─────────────────────────────────────────────────────
      gridTemplateColumns: {
        "auto-sm": "repeat(auto-fill, minmax(200px, 1fr))",
        "auto-md": "repeat(auto-fill, minmax(280px, 1fr))",
        "auto-lg": "repeat(auto-fill, minmax(320px, 1fr))",
      },

      // ── Z-index scale ────────────────────────────────────────────────────
      zIndex: {
        dropdown: "1000",
        sticky:   "1020",
        overlay:  "1040",
        modal:    "1050",
        toast:    "1080",
        tooltip:  "1100",
      },
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────────────
  plugins: [
    // Class strategy avoids global form-reset conflicts with existing styles
    formsPlugin({ strategy: "class" }),

    // Prose typography for markdown/rich-text content (e.g. product descriptions)
    typographyPlugin,

    // aspect-ratio utilities (also built into Tailwind v3.2+/v4 core, but
    // included here for explicit cross-version compatibility)
    aspectRatioPlugin,

    // NOTE: @tailwindcss/line-clamp is NOT installed — line-clamp utilities
    // (line-clamp-{n}) are built into Tailwind v4 core.
  ],
};

export default config;
