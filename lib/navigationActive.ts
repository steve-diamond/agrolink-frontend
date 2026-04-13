const ACTIVE_ROUTE_GROUPS: Record<string, string[]> = {
  "/": ["/"],
  "/dashboard": ["/dashboard"],
  "/marketplace": ["/marketplace"],
  "/product-listing": ["/product-listing", "/farmer/upload"],
  "/order-management": ["/order-management", "/orders"],
  "/loan-application": ["/loan-application"],
  "/logistics": ["/logistics"],
  "/warehouse": ["/warehouse"],
  "/equipment-listing": ["/equipment-listing"],
  "/about-us": ["/about-us"],
  "/investor": ["/investor"],
  "/admin/login": ["/admin/login", "/admin"],
  "/admin": ["/admin", "/admin/login"],
  "/login": ["/login"],
  "/register": ["/register"],
  "/farmer/upload": ["/farmer/upload", "/product-listing"],
  "/orders": ["/orders", "/order-management"],
};

export function isRouteActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }

  const candidates = ACTIVE_ROUTE_GROUPS[href] ?? [href];

  return candidates.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
