import type {
  Metadata,
  Viewport
} from "next";

import {
  ServiceWorkerRegister,
} from "@/components/pwa/service-worker-register";

import "./globals.css";

/**
 * MOBILE / PWA VIEWPORT
 * ---------------------
 *
 * Next.js treats viewport configuration separately from
 * ordinary page metadata.
 *
 * viewportFit: "cover"
 *
 * allows an installed PWA to use the full physical screen,
 * including areas around notches and rounded corners.
 *
 * We then protect important UI using CSS safe-area insets.
 */
export const viewport: Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  viewportFit:
    "cover",

  themeColor:
    "#059669",

  colorScheme:
    "light",
};

export const metadata: Metadata = {
  /**
   * PRODUCT METADATA
   * ----------------
   *
   * `default` is used when a page doesn't define
   * its own title.
   *
   * `template` lets future pages become:
   *
   *   Tenants | Abang PH
   *   Payments | Abang PH
   *   Reports | Abang PH
   */

  title: {
    default:
      "Abang PH",

    template:
      "%s | Abang PH",
  },

  description:
    "Simple rental management for Filipino landlords. Manage properties, tenants, rent, payments, expenses, and reports in one place.",

  applicationName:
    "Abang PH",

  keywords: [
    "rental management",
    "property management",
    "landlord",
    "boarding house",
    "apartment",
    "Philippines",
    "rent tracking",
  ],
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],

    shortcut: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],

    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  appleWebApp: {
    capable:
      true,

    title:
      "Abang PH",

    statusBarStyle:
      "default",
  },
  manifest:
    "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
  React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        <ServiceWorkerRegister />
      </body>
    </html>
  );
}