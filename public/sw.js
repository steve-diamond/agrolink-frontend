// ─── DosAgrolink Service Worker ───────────────────────────────────────────────
// Strategy:
//   Navigation (pages)  → NetworkFirst  → offline fallback
//   /_next/static/**    → CacheFirst    → immutable chunks
//   /api/**             → NetworkFirst  → 3 s timeout → cached → 503 JSON
//   Images              → CacheFirst    → max 60 entries, 7-day TTL
//   Everything else     → NetworkFirst

const SW_VERSION = "dosagro-v2";

const PAGES_CACHE  = `${SW_VERSION}-pages`;
const STATIC_CACHE = `${SW_VERSION}-static`;
const IMAGES_CACHE = `${SW_VERSION}-images`;
const API_CACHE    = `${SW_VERSION}-api`;

const OFFLINE_URL  = "/offline";
const IMAGE_MAX_ENTRIES = 60;
const IMAGE_MAX_AGE_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_TIMEOUT_MS    = 3000;

// ── Install: precache offline shell ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/manifest.json"]))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

// ── Activate: purge old cache versions ───────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(SW_VERSION))
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// ── Fetch router ─────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== "GET") return;
  try {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Immutable Next.js chunks → CacheFirst
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }

    // Images → CacheFirst with TTL + entry limit
    if (/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(url.pathname)) {
      event.respondWith(imageCache(request));
      return;
    }

    // API routes → NetworkFirst with timeout, cached fallback
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(networkFirstApi(request));
      return;
    }

    // Page navigations → NetworkFirst, offline fallback
    if (request.mode === "navigate") {
      event.respondWith(networkFirstPage(request));
      return;
    }

    // Everything else → NetworkFirst
    event.respondWith(networkFirst(request, PAGES_CACHE));
  } catch {
    // Ignore malformed requests
  }
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

/** CacheFirst — serve from cache; populate on miss */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 404 });
  }
}

/** NetworkFirst — try network, fall back to cache */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("", { status: 503 });
  }
}

/** NetworkFirst for page navigations — offline page fallback */
async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline ?? new Response("You are offline", { status: 503, headers: { "Content-Type": "text/html" } });
  }
}

/** NetworkFirst for /api — 3-second timeout, cached fallback, JSON 503 */
async function networkFirstApi(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timer);
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline", cached: false }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/** CacheFirst for images with TTL and max-entry eviction */
async function imageCache(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    const cachedAt = cached.headers.get("x-sw-cached-at");
    if (cachedAt && Date.now() - Number(cachedAt) < IMAGE_MAX_AGE_MS) {
      return cached;
    }
  }
  try {
    const response = await fetch(request);
    if (!response.ok) return response;

    // Clone and stamp with cache timestamp
    const body = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set("x-sw-cached-at", String(Date.now()));
    const stamped = new Response(body, { status: response.status, headers });

    // Evict oldest entries when over limit
    const keys = await cache.keys();
    if (keys.length >= IMAGE_MAX_ENTRIES) {
      await Promise.all(keys.slice(0, keys.length - IMAGE_MAX_ENTRIES + 1).map((k) => cache.delete(k)));
    }
    cache.put(request, stamped.clone());
    return stamped;
  } catch {
    return cached ?? new Response("", { status: 404 });
  }
}
