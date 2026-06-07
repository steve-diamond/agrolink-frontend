/**
 * VisuallyHidden — renders children that are invisible on screen but
 * fully accessible to screen readers.
 *
 * Prefer Tailwind's `className="sr-only"` for simple text spans.
 * Use this component when you need to wrap more complex subtrees or
 * when the element type matters (e.g., `as="h1"` for a visually-hidden
 * page heading that still contributes to the document outline).
 *
 * @example
 * // Add context text for an icon-only button
 * <button onClick={close}>
 *   <XMarkIcon aria-hidden />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 *
 * // Announce live region updates
 * <VisuallyHidden as="p" aria-live="polite">{statusMessage}</VisuallyHidden>
 */

import * as React from "react";

type AsProp<T extends React.ElementType> = {
  as?: T;
};

type VisuallyHiddenProps<T extends React.ElementType = "span"> = AsProp<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof AsProp<T>> & {
    children: React.ReactNode;
  };

export function VisuallyHidden<T extends React.ElementType = "span">({
  as,
  children,
  ...rest
}: VisuallyHiddenProps<T>) {
  const Tag = (as ?? "span") as React.ElementType;
  return (
    <Tag className="sr-only" {...rest}>
      {children}
    </Tag>
  );
}
