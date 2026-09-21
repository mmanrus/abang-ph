import { withSentryConfig } from "@sentry/nextjs";
import type {
  NextConfig,
} from "next";

const isProduction =
  process.env.APP_ENV ===
  "production";

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

  ...(isProduction
    ? [
      {
        key:
          "Strict-Transport-Security",

        // Tell browsers that Abang must only be accessed
        // through HTTPS for the next year.
        //
        // We enable this only in the real production
        // environment so local HTTP development remains
        // unaffected.
        value:
          "max-age=31536000",
      },
    ]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source:
          "/(.*)",

        headers:
          securityHeaders,
      },

      {
        source:
          "/sw.js",

        headers: [
          {
            key:
              "Cache-Control",
            value:
              "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "abang-ph",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",
  webpack: {
    /**
     * Abang does not currently use Vercel Cron jobs.
     * Keep automatic cron-monitor instrumentation disabled
     * until we intentionally add scheduled jobs.
     */
    automaticVercelMonitors: false,

    treeshake: {
      removeDebugLogging: true,
    },
  },
});
