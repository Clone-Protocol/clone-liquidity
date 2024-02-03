// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    environment: process.env.NODE_ENV,
    dsn: "https://a3f881f2cc7427055a3f6de2646ade05@o4506395017216000.ingest.sentry.io/4506511611396096",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}