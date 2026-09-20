import type {
  NextConfig,
} from "next";

/**
 * Basic HTTP security headers.
 *
 * These reduce several common browser-level risks.
 *
 * We intentionally postpone a strict Content-Security-Policy
 * until deployment because CSP must be tested against every
 * script/resource the production application actually uses.
 */

const securityHeaders = [
  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },

  {
    key:
      "Permissions-Policy",

    value:
      "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig:
  NextConfig = {
    async headers() {
      return [
        {
          source:
            "/(.*)",

          headers:
            securityHeaders,
        },
      ];
    },
  };

export default nextConfig;