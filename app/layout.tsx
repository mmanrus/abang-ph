import type {
  Metadata,
} from "next";

import "./globals.css";

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
      </body>
    </html>
  );
}