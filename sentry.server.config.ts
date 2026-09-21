// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection

Sentry.init({
  dsn:
    "https://85886bed09fc4c14f6293d6b05de0602@o4512123837022208.ingest.us.sentry.io/4512123837153280",

  /**
   * Abang contains landlord, tenant, rent, expense,
   * and payment-related information.
   *
   * Error monitoring is for diagnosing software failures,
   * not for storing customer/business data.
   */
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },

  /**
   * Final privacy boundary before an event leaves Abang.
   *
   * We remove request/user/extra/breadcrumb data and replace
   * exception messages with a generic message while preserving
   * stack frames for debugging.
   */
  beforeSend(event) {
    delete event.user;
    delete event.request;
    delete event.extra;
    delete event.breadcrumbs;

    if (
      event.exception?.values
    ) {
      for (
        const exception of
        event.exception.values
      ) {
        exception.value =
          "Unhandled application error.";
      }
    }

    if (event.message) {
      event.message =
        "Unhandled application error.";
    }

    return event;
  },
});