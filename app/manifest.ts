import type {
    MetadataRoute,
} from "next";

/**
 * ABANG PH WEB APP MANIFEST
 * -------------------------
 *
 * The manifest describes how Abang PH should behave when
 * installed on a phone, tablet, or desktop.
 *
 * It controls things such as:
 *
 * - app name
 * - home-screen name
 * - launch URL
 * - standalone display mode
 * - app colors
 * - icons
 *
 * IMPORTANT:
 *
 * This does NOT make the application work offline.
 *
 * Offline behavior and caching belong to the service worker,
 * which we will handle separately later in Phase 8B.
 */
export default function manifest():
    MetadataRoute.Manifest {
    return {
        /**
         * Stable application identity.
         *
         * This helps the browser understand that future manifest
         * changes still refer to the same installed Abang PH app.
         */
        id: "/",

        name:
            "Abang PH",

        /**
         * Used when there is limited space underneath an app icon.
         */
        short_name:
            "Abang PH",

        description:
            "Simple rental management for Filipino landlords. Manage properties, tenants, rent, payments, expenses, and reports in one place.",

        /**
         * When the installed app is opened, go directly to the
         * landlord application rather than the marketing page.
         *
         * If the user is signed out, our existing authentication
         * protection will send them to /login.
         */
        start_url:
            "/dashboard",

        /**
         * The installed PWA is allowed to navigate throughout
         * the entire Abang PH application.
         */
        scope:
            "/",

        /**
         * standalone removes normal browser chrome and makes
         * Abang feel much closer to a native application.
         */
        display:
            "standalone",

        background_color:
            "#ffffff",

        /**
         * Matches the emerald identity already used by Abang.
         */
        theme_color:
            "#059669",

        lang:
            "en-PH",

        categories: [
            "business",
            "finance",
            "productivity",
        ],

        /**
         * TEMPORARY ICON
         * --------------
         *
         * We already have app/icon.svg.
         *
         * In Phase 8B.2 we will replace/extend this with proper:
         *
         * 192×192
         * 512×512
         * maskable icon
         *
         * for stronger Android/PWA compatibility.
         */
        icons: [
            {
                src:
                    "/icons/abang-192.png",

                sizes:
                    "192x192",

                type:
                    "image/png",

                purpose:
                    "any",
            },

            {
                src:
                    "/icons/abang-512.png",

                sizes:
                    "512x512",

                type:
                    "image/png",

                purpose:
                    "any",
            },

            {
                src:
                    "/icons/abang-maskable-512.png",

                sizes:
                    "512x512",

                type:
                    "image/png",

                purpose:
                    "maskable",
            },
        ],
    };
}