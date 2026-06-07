/**
 * announce — utility to push a text string into the global `aria-live` region.
 *
 * The region is mounted in the root layout as:
 *   <div id="aria-live-region" aria-live="polite" aria-atomic="true" class="sr-only" />
 *
 * Use `"assertive"` mode sparingly — only for critical errors/alerts that must
 * interrupt the user immediately.
 *
 * @param message  Text to read aloud.
 * @param mode     "polite" (default) waits for the user to be idle;
 *                 "assertive" interrupts immediately.
 *
 * @example
 * import { announce } from "@lib/announce";
 * // After saving a form:
 * announce("Profile saved successfully.");
 * // For a critical error:
 * announce("Payment failed. Please try again.", "assertive");
 */
export function announce(message: string, mode: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return; // SSR guard

  const el = document.getElementById("aria-live-region");
  if (!el) return;

  // Update aria-live mode so assertive messages interrupt immediately
  el.setAttribute("aria-live", mode);

  // Blank → set to force re-read in case the same string is announced twice
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = message;
    // Restore to polite after short delay so subsequent messages are non-intrusive
    if (mode === "assertive") {
      setTimeout(() => el.setAttribute("aria-live", "polite"), 500);
    }
  });
}

/**
 * React hook that returns the `announce` function.
 * Convenience wrapper — identical to importing `announce` directly.
 *
 * @example
 * const announce = useAnnounce();
 * announce("Item added to cart");
 */
export function useAnnounce() {
  return announce;
}
