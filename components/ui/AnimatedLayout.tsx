"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

// ─── Variants ──────────────────────────────────────────────────────────────────

/** Standard pages: fade + slight slide up */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/** Child stagger item — apply to direct children that should stagger */
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/** Modals: scale up from center + fade */
const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.94,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

/** Overlays: fade backdrop + content */
const overlayBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const overlayContentVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.05, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15 } },
};

/** Drawers: slide from edge */
function makeDrawerVariants(direction: "left" | "right" | "bottom"): Variants {
  const offset = direction === "bottom" ? { y: "100%" } : direction === "left" ? { x: "-100%" } : { x: "100%" };
  const exitOffset = direction === "bottom" ? { y: "100%" } : direction === "left" ? { x: "-100%" } : { x: "100%" };
  return {
    initial: { opacity: 0, ...offset },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      ...exitOffset,
      transition: { duration: 0.22, ease: "easeIn" },
    },
  };
}

// ─── Components ───────────────────────────────────────────────────────────────

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page wrapper — fade + slide-up on enter, stagger children.
 * Use as a drop-in wrapper inside page.tsx files.
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      // Prevent layout shift: reserve space during animation
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger item — wrap direct children inside AnimatedPage to stagger them.
 */
export function StaggerItem({ children, className }: AnimatedPageProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface AnimatedModalProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal transition: scale up from center + fade.
 * Controls its own AnimatePresence so it can be unmounted by the parent.
 */
export function AnimatedModal({ open, children, className }: AnimatedModalProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
          style={{ willChange: "opacity, transform" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AnimatedDrawerProps {
  open: boolean;
  direction?: "left" | "right" | "bottom";
  children: React.ReactNode;
  className?: string;
}

/**
 * Drawer transition: slides from specified edge (default: right).
 */
export function AnimatedDrawer({ open, direction = "right", children, className }: AnimatedDrawerProps) {
  const variants = makeDrawerVariants(direction);
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="drawer"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
          style={{ willChange: "opacity, transform" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AnimatedOverlayProps {
  open: boolean;
  children: React.ReactNode;
  backdropClassName?: string;
  contentClassName?: string;
  onBackdropClick?: () => void;
}

/**
 * Overlay transition: fade backdrop first, then fade+slide content in.
 */
export function AnimatedOverlay({
  open,
  children,
  backdropClassName = "fixed inset-0 bg-black/50 z-40",
  contentClassName,
  onBackdropClick,
}: AnimatedOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            key="overlay-backdrop"
            variants={overlayBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={backdropClassName}
            onClick={onBackdropClick}
            style={{ willChange: "opacity" }}
          />
          <motion.div
            key="overlay-content"
            variants={overlayContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={contentClassName}
            style={{ willChange: "opacity, transform" }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Route-level transition wrapper ───────────────────────────────────────────

interface AnimatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Drop this inside the root layout (server component) via a client wrapper.
 * It listens to pathname changes and applies a fade+slide-up transition
 * between routes using AnimatePresence.
 *
 * IMPORTANT: This must be a client component and receive children as a prop
 * so that the server layout component can stay a server component.
 */
export default function AnimatedLayout({ children }: AnimatedLayoutProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        // Prevent layout shift: keep the element in flow during animation
        style={{ willChange: "opacity, transform", minHeight: "inherit" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
