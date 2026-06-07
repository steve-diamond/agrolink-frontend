"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

// ── Sub-components ────────────────────────────────────────────────────────────

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio class, e.g. "aspect-video" or "aspect-square" */
  aspectClass?: string;
}

/** Full-bleed image at the top of a Card */
export const CardImage: React.FC<CardImageProps> = ({
  className, alt = "", aspectClass = "aspect-video", ...props
}) => (
  <div className={cn("overflow-hidden rounded-t-xl", aspectClass)}>
    <img
      alt={alt}
      className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
      {...props}
    />
  </div>
);

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Large heading */
  title?: React.ReactNode;
  /** Subtitle / description beneath the title */
  subtitle?: React.ReactNode;
  /** Trailing element (e.g. badge, menu button) */
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className, title, subtitle, action, children, ...props
}) => (
  <div className={cn("px-5 pt-5 pb-3 flex items-start justify-between gap-3", className)} {...props}>
    <div className="min-w-0">
      {title && <h3 className="text-base font-semibold text-[var(--color-fg)] leading-snug truncate">{title}</h3>}
      {subtitle && <p className="text-sm text-[var(--color-fg-muted)] mt-0.5">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div className={cn("px-5 py-3 text-sm text-[var(--color-fg-muted)]", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div
    className={cn(
      "px-5 pb-5 pt-3 flex items-center gap-3",
      "border-t border-[var(--color-border-subtle)] mt-auto",
      className
    )}
    {...props}
  />
);

// ── Card root ─────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lift the card with a deeper shadow on hover */
  hoverable?: boolean;
  /** Wrap in a clickable anchor-style element (adds cursor-pointer + focus ring) */
  interactive?: boolean;
  /** Remove the default white background / border */
  flat?: boolean;
}

/**
 * Composable card container.  Use `CardImage`, `CardHeader`, `CardBody`,
 * and `CardFooter` as children.
 *
 * @example
 * <Card hoverable>
 *   <CardImage src={product.image} alt={product.name} />
 *   <CardHeader title={product.name} subtitle={product.category} />
 *   <CardBody>{product.description}</CardBody>
 *   <CardFooter>
 *     <Button size="sm">Buy Now</Button>
 *   </CardFooter>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, interactive = false, flat = false, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={hoverable ? { y: -3, boxShadow: "var(--shadow-lg)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden",
        !flat && [
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "shadow-[var(--shadow-sm)]",
        ],
        hoverable && "transition-shadow duration-200",
        interactive && [
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        ],
        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Card.displayName = "Card";
