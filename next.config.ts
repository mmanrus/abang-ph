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

export default nextConfig;