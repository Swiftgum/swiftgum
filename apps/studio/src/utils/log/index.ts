"use server";

import {
	type LogInput,
	addMiddleware,
	createSupabaseDriver,
	initializeLogger,
	log,
} from "@knowledgex/shared/log";
import { geolocation, ipAddress } from "@vercel/functions";
import { headers } from "next/headers";
import { createServerOnlyClient } from "../supabase/server";

const client = await createServerOnlyClient();
const logDriver = createSupabaseDriver(client);

initializeLogger(logDriver);

// Add middleware to include IP address
addMiddleware(async (input: LogInput) => {
	const headersList = await headers();

	const geo = geolocation({ headers: headersList });
	const ip = ipAddress({ headers: headersList }) || "127.0.0.1";

	return {
		...input,
		metadata: {
			metadata: input.metadata || {},
			_origin: {
				geo,
				ip,
			},
		},
	};
});

export { log };
