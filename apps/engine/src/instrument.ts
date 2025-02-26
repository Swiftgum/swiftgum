// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
	dsn: "https://823427181b533c665a3101e9012e05b6@o4508885372764160.ingest.us.sentry.io/4508885397667840",
	integrations: [nodeProfilingIntegration()],
	// Tracing
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
