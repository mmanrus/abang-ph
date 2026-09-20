"use client";

import {
  useEffect,
} from "react";

/**
 * SERVICE WORKER REGISTRATION
 * ---------------------------
 *
 * This component has no visible UI.
 *
 * Its only responsibility is registering:
 *
 *   /sw.js
 *
 * with the browser.
 *
 * IMPORTANT:
 *
 * We register it only in a production build.
 *
 * This prevents service-worker behavior from making normal
 * `npm run dev` development confusing through stale assets.
 *
 * To test locally:
 *
 *   npm run build
 *   npm start
 *
 * localhost is permitted to use service workers.
 */
export function ServiceWorkerRegister() {
  useEffect(
    () => {
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        return;
      }

      if (
        !(
          "serviceWorker" in
          navigator
        )
      ) {
        return;
      }

      async function register() {
        try {
          await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope:
                "/",

              /**
               * Ask the browser not to reuse an old HTTP
               * cache entry when checking the service-worker
               * script for updates.
               */
              updateViaCache:
                "none",
            },
          );
        } catch {
          /**
           * PWA support is progressive enhancement.
           *
           * If service-worker registration fails, Abang
           * should continue functioning as a normal online
           * web application.
           */
        }
      }

      void register();
    },
    [],
  );

  return null;
}