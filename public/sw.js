/**
 * ABANG PH SERVICE WORKER
 * =======================
 *
 * Phase 8B.5 — Safe Static Caching
 *
 * SECURITY PRINCIPLE
 * ------------------
 *
 * We cache only PUBLIC STATIC ASSETS.
 *
 * We deliberately do NOT cache:
 *
 * - HTML pages
 * - API responses
 * - authentication responses
 * - tenant data
 * - payment data
 * - expenses
 * - reports
 * - dashboard responses
 *
 * This prevents sensitive landlord information from being
 * persisted in Cache Storage on shared devices.
 */

const CACHE_VERSION =
  "v2";

const STATIC_CACHE =
  `abang-static-${CACHE_VERSION}`;

/**
 * Public assets that are safe to keep locally.
 *
 * These files contain application branding only.
 *
 * We intentionally do NOT precache:
 *
 *   /
 *   /dashboard
 *   /login
 *
 * because those are HTML/server-rendered routes.
 */
const SAFE_PRECACHE_ASSETS = [
  "/icon.svg",
  "/icons/abang-192.png",
  "/offline.html",
  "/icons/abang-512.png",
  "/icons/abang-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

/**
 * INSTALL
 * -------
 *
 * Cache only explicitly-approved public assets.
 */
self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      (async () => {
        const cache =
          await caches.open(
            STATIC_CACHE,
          );

        await cache.addAll(
          SAFE_PRECACHE_ASSETS,
        );

        await self.skipWaiting();
      })(),
    );
  },
);

/**
 * ACTIVATE
 * --------
 *
 * Delete old Abang caches whenever CACHE_VERSION changes.
 *
 * Example:
 *
 * v1
 * ↓
 * deploy v2
 * ↓
 * v1 cache removed
 */
self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      (async () => {
        const cacheNames =
          await caches.keys();

        await Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(
                  "abang-",
                ) &&
                cacheName !==
                STATIC_CACHE,
            )
            .map(
              (cacheName) =>
                caches.delete(
                  cacheName,
                ),
            ),
        );

        await self.clients.claim();
      })(),
    );
  },
);

/**
 * Returns true only for resources we explicitly consider
 * safe to persist.
 */
function isSafeStaticRequest(
  url,
) {
  return (
    url.pathname.startsWith(
      "/_next/static/",
    ) ||
    url.pathname.startsWith(
      "/icons/",
    ) ||
    url.pathname ===
    "/icon.svg"
  );
}

/**
 * CACHE-FIRST
 * -----------
 *
 * Good for immutable/static resources.
 *
 * Flow:
 *
 * cache
 *   ↓
 * found?
 *   ├── yes → return immediately
 *   └── no  → network
 *               ↓
 *             cache safe response
 *               ↓
 *             return response
 */
async function cacheFirst(
  request,
) {
  const cachedResponse =
    await caches.match(
      request,
    );

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse =
    await fetch(
      request,
    );

  /**
   * Only cache successful same-origin responses.
   *
   * Never cache:
   *
   * 404
   * 500
   * redirects
   * opaque cross-origin responses
   */
  if (
    networkResponse.ok &&
    networkResponse.type ===
    "basic"
  ) {
    const cache =
      await caches.open(
        STATIC_CACHE,
      );

    await cache.put(
      request,
      networkResponse.clone(),
    );
  }

  return networkResponse;
}

/**
 * FETCH
 * -----
 *
 * Most Abang requests are deliberately ignored.
 *
 * If we do not call respondWith(), the browser performs the
 * request normally through the network.
 */
self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    /**
     * Never cache mutations.
     */
    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url,
      );

    /**
     * Never intercept another origin.
     */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    /**
     * Never intercept API requests.
     */
    if (
      url.pathname.startsWith(
        "/api/",
      )
    ) {
      return;
    }

    /**
     * SAFE STATIC ASSETS COME FIRST.
     *
     * This intentionally happens BEFORE the navigation check.
     *
     * Why?
     *
     * If somebody directly opens:
     *
     *   /icons/abang-512.png
     *
     * Chrome treats that as a navigation request.
     *
     * Since the URL itself is explicitly allowlisted as a
     * safe static asset, it is still safe to serve it from
     * Cache Storage.
     */
    if (
      isSafeStaticRequest(
        url,
      )
    ) {
      event.respondWith(
        cacheFirst(
          request,
        ),
      );

      return;
    }

    /**
     * Never cache normal page navigations.
     *
     * /dashboard
     * /properties
     * /tenants
     * /payments
     * /reports
     *
     * remain network-only.
     */
    /**
 * PAGE NAVIGATION
 * ---------------
 *
 * Authenticated pages remain NETWORK ONLY.
 *
 * We never store their successful responses.
 *
 * If the network is unavailable, we return our
 * generic cached offline screen instead.
 *
 * This gives users a useful offline experience
 * without caching private landlord information.
 */
    if (
      request.mode ===
      "navigate"
    ) {
      event.respondWith(
        (async () => {
          try {
            /**
             * NETWORK FIRST — and importantly:
             *
             * we do NOT cache this response.
             */
            return await fetch(
              request,
            );
          } catch {
            /**
             * Network failed.
             *
             * Return the generic offline page that was
             * precached during service-worker installation.
             */
            const offlinePage =
              await caches.match(
                "/offline.html",
              );

            if (
              offlinePage
            ) {
              return offlinePage;
            }

            /**
             * Extremely defensive fallback if installation
             * somehow occurred without offline.html.
             */
            return new Response(
              "You're offline. Abang PH needs an internet connection to load your rental records.",
              {
                status: 503,

                headers: {
                  "Content-Type":
                    "text/plain; charset=utf-8",
                },
              },
            );
          }
        })(),
      );

      return;
    }
  },
);