import { init } from "@sentry/node";
import { env } from "./env";

export function startSentry() {
  if (process.env.SENTRY_DSN) {
    init({ dsn: env.SENTRY_DSN, environment: process.env.ENVIRONMENT });
  }
}
