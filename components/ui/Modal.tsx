"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";
import { useFocusTrap, useFocusRestore } from "../FocusManager";

// ── Size map ──────────────────────────────────────────────────────────────────

const sizeClasses = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-xl",
  full: "max-w-full mx-4",
};

// ── Sub-components ────────────────────────────────────────────────────────────

export const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  onClose?: () => void;
}> = ({ className, title, onClose, children, ...props }) => (
  <div
    className={cn("flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[var(--color-border)]", className)}
    {...props}
  >
    <div className="min-w-0">
      {title && (
        <h2 className="text-lg font-semibold text-[var(--color-fg)] leading-snug">{title}</h2>
      )}
      {children}
    </div>
    {onClose && (
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="shrink-0 rounded-md p-1.5 text-[var(--color-fg-muted)] hover:bg-gray-100 hover:text-[var(--color-fg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
        </svg>
      </button>
    )}
  </div>
);

export const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div className={cn("px-6 py-5 overflow-y-auto flex-1 text-sm text-[var(--color-fg-muted)]", className)} {...props} />
);

export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 px-6 py-4",
      "border-t border-[var(--color-border)] bg-gray-50/50",
      className
    )}
    {...props}
  />
);

// ── Modal root ────────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the backdrop or close button is clicked */
  onClose: () => void;
  /** Modal width preset */
  size?: keyof typeof sizeClasses;
  /** Prevent closing on backdrop click */
  disableBackdropClose?: boolean;
  /** Additional class for the dialog panel */
  className?: string;
  children?: React.ReactNode;
  /** Accessible title (used as aria-label when ModalHeader is absent) */
  ariaLabel?: string;
}

/**
 * Accessible modal dialog with animated backdrop and panel.
 * Traps focus within the modal while open and restores it on close.
 * Closes on Escape key and (optionally) backdrop click.
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
 *   <ModalHeader title="Confirm Action" onClose={() => setIsOpen(false)} />
 *   <ModalBody>Are you sure you want to delete this product?</ModalBody>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *   </ModalFooter>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  open, onClose, size = "md", disableBackdropClose = false,
  className, children, ariaLabel,
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Restore focus to the trigger element when the modal closes
  useFocusRestore(open);

  // Trap focus within the panel while open
  useFocusTrap(panelRef, open);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-describedby={ariaLabel ? undefined : "modal-desc"}
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={!disableBackdropClose ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "relative w-full flex flex-col max-h-[90vh]",
              "bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-2xl)]",
              "border border-[var(--color-border)]",
              sizeClasses[size],
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
