// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

/* Sentry.init({
  dsn: "https://5ead9c18914405e06d9a33e36373d27f@o4511266429534208.ingest.us.sentry.io/4511266433531904",

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
}); */

Sentry.init({
  dsn: "https://5ead9c18914405e06d9a33e36373d27f@o4511266429534208.ingest.us.sentry.io/4511266433531904",
  tracesSampleRate: 0, // ❌ sin performance tracking
  sendDefaultPii: false, // ❌ sin datos personales
  environment: process.env.NODE_ENV,
});
