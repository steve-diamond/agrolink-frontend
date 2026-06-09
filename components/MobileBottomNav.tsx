"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiHome,
  FiShoppingBag,
  FiPlusCircle,
  FiClipboard,
  FiUser,
} from "react-icons/fi";
import type { IconType } from "react-icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NavItem {
  key: string;
  label: string;
  href: string;
  Icon: IconType;
  /** If true the item is rendered as the central "action" button */
  isAction?: boolean;
  /** If provided, renders a badge with this count (hidden when 0) */
  badge?: number;
}

// ---------------------------------------------------------------------------
// Hook: hide on scroll-down, show on scroll-up
// ---------------------------------------------------------------------------
function useScrollVisibility(threshold = 6) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        // Always show when near the top
        if (currentY < threshold) {
          setVisible(true);
        } else if (currentY > lastY.current + 4) {
          setVisible(false); // scrolling down
        } else if (currentY < lastY.current - 4) {
          setVisible(true); // scrolling up
        }
        lastY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}

// ---------------------------------------------------------------------------
// Hook: fetch pending orders count
// ---------------------------------------------------------------------------
function usePendingOrdersCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/orders", {
          signal: controller.signal,
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const json = await res.json() as unknown;
        // Support both { data: Order[] } and Order[] response shapes
        const orders = Array.isArray(json)
          ? json
          : Array.isArray((json as { data?: unknown[] }).data)
          ? (json as { data: unknown[] }).data
          : [];
        type OrderLike = { status?: string };
        const pending = (orders as OrderLike[]).filter(
          (o) => typeof o?.status === "string" && o.status.toLowerCase() === "pending"
        ).length;
        if (!cancelled) setCount(pending);
      } catch {
        // Network errors / unauthenticated — silently ignore
      }
    };

    fetchCount();
    // Refresh every 60 s
    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return count;
}

// ---------------------------------------------------------------------------
// Sub-component: badge dot
// ---------------------------------------------------------------------------
function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} pending order${count !== 1 ? "s" : ""}`}
      aria-live="polite"
      aria-atomic="true"
      className={`
        absolute -top-0.5 -right-1 flex items-center justify-center
        rounded-full bg-red-500 text-white font-bold leading-none
        ring-2 ring-white
        ${count > 9 ? "text-[8px] min-w-4.5 h-3.5 px-1" : "text-[9px] min-w-3.5 h-3.5"}
      `}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function MobileBottomNav() {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const authRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];

  const isAuthRoute =
    normalizedPath === "/register" ||
    normalizedPath.startsWith("/register/") ||
    authRoutes.includes(normalizedPath) ||
    authRoutes.some((route) => normalizedPath.endsWith(route));

  if (isAuthRoute) {
    return null;
  }

  const navVisible = useScrollVisibility();
  const pendingCount = usePendingOrdersCount();

  const haptic = useCallback(() => {
    try {
      if ("vibrate" in navigator) navigator.vibrate(8);
    } catch {
      // Ignore — vibrate may throw in some restricted contexts
    }
  }, []);

  const navItems: NavItem[] = [
    {
      key: "home",
      label: "Home",
      href: "/",
      Icon: FiHome,
    },
    {
      key: "marketplace",
      label: "Market",
      href: "/marketplace",
      Icon: FiShoppingBag,
    },
    {
      key: "create",
      label: "Add",
      href: "/product-listing",
      Icon: FiPlusCircle,
      isAction: true,
    },
    {
      key: "orders",
      label: "Orders",
      href: "/orders",
      Icon: FiClipboard,
      badge: pendingCount,
    },
    {
      key: "profile",
      label: "Profile",
      href: "/dashboard",
      Icon: FiUser,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    // Only render on mobile/tablet — hidden on lg+ via Tailwind
    <nav
      aria-label="Mobile navigation"
      className={`
        lg:hidden
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200
        shadow-[0_-2px_16px_rgba(0,0,0,0.08)]
        transition-transform duration-300 ease-in-out
        pb-[env(safe-area-inset-bottom,0px)]
        ${navVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <ul
        role="list"
        className="flex items-end justify-around px-2 pt-1 pb-2"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);

          if (item.isAction) {
            return (
              <li key={item.key} className="flex flex-col items-center">
                <Link
                  href={item.href}
                  onClick={haptic}
                  aria-label={item.label}
                  className={`
                    relative -mt-5 flex items-center justify-center
                    w-14 h-14 rounded-full
                    bg-green-600 shadow-lg shadow-green-600/40
                    text-white
                    ring-4 ring-white
                    active:scale-95
                    transition-all duration-150
                    ${active ? "bg-green-700" : "hover:bg-green-700"}
                  `}
                >
                  <item.Icon size={26} aria-hidden="true" />
                </Link>
                <span className="text-[10px] font-medium text-gray-400 mt-1">
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.key} className="flex flex-col items-center min-w-14">
              <Link
                href={item.href}
                onClick={haptic}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center gap-0.5 group"
              >
                {/* Active indicator bar */}
                <span
                  className={`
                    absolute -top-1 left-1/2 -translate-x-1/2
                    h-0.75 rounded-b-full
                    bg-green-600
                    transition-all duration-200
                    ${active ? "w-5 opacity-100" : "w-0 opacity-0"}
                  `}
                />

                {/* Icon with badge */}
                <span className="relative p-1.5">
                  <item.Icon
                    size={22}
                    aria-hidden="true"
                    className={`
                      transition-colors duration-150
                      ${active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}
                    `}
                  />
                  {typeof item.badge === "number" && (
                    <Badge count={item.badge} />
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    text-[10px] font-medium leading-none
                    transition-colors duration-150
                    ${active ? "text-green-600" : "text-gray-400"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
