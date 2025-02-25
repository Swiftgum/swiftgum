import { z } from "zod";

export interface ProviderAuth<
	ProviderID extends string,
	Configuration extends z.ZodTypeAny,
	AuthSession extends z.ZodTypeAny,
	Credentials extends z.ZodTypeAny,
> {
	providerId: ProviderID;

	configurationSchema: Configuration;
	authSessionSchema: AuthSession;
	credentialsSchema: Credentials;

	initiate: ({
		configuration,
		callbackUrl,
		sessionId,
	}: {
		configuration: z.infer<Configuration>;
		callbackUrl: URL;
		sessionId: string;
	}) => Promise<{
		session: z.infer<AuthSession>;
		nextUrl: URL;
	}>;

	callback: ({
		configuration,
		authSession,
		request,
	}: {
		configuration: z.infer<Configuration>;
		authSession: z.infer<AuthSession>;
		request: Request;
	}) => Promise<{ credentials: z.infer<Credentials> }>;
}

export const providerAuth = <
	ProviderID extends string,
	Configuration extends z.ZodTypeAny,
	AuthSession extends z.ZodTypeAny,
	Credentials extends z.ZodTypeAny,
>({
	providerId,
	configurationSchema,
	authSessionSchema,
	credentialsSchema,

	initiate,
	callback,
}: ProviderAuth<ProviderID, Configuration, AuthSession, Credentials>) => {
	const owns = (_providerId: string) => _providerId === providerId;
	const wrap = <T extends z.ZodTypeAny>(schema: T) => {
		return z.object({
			providerId: z.literal(providerId) as unknown as z.ZodLiteral<ProviderID>,
			data: schema,
		});
	};

	const _initiate = async ({
		configuration,
		callbackUrl,
		sessionId,
	}: {
		configuration: {
			providerId: string;
			data: z.infer<Configuration>;
		};
		callbackUrl: URL;
		sessionId: string;
	}) => {
		const { session, nextUrl } = await initiate({
			configuration: configurationSchema.parse(configuration.data),
			callbackUrl: new URL(callbackUrl),
			sessionId,
		});

		return {
			session: {
				providerId,
				data: authSessionSchema.parse(session),
			},
			nextUrl: new URL(nextUrl),
		};
	};

	const _callback = async ({
		configuration,
		authSession,
		request,
	}: {
		configuration: {
			providerId: string;
			data: z.infer<Configuration>;
		};
		authSession: {
			providerId: string;
			data: z.infer<AuthSession>;
		};
		request: Request;
	}) => {
		const { credentials } = await callback({
			configuration: configurationSchema.parse(configuration.data),
			authSession: authSessionSchema.parse(authSession.data),
			request,
		});

		return {
			providerId,
			data: credentialsSchema.parse(credentials),
		};
	};

	return {
		providerId,
		owns,

		configurationSchema: wrap(configurationSchema),
		authSessionSchema: wrap(authSessionSchema),
		credentialsSchema: wrap(credentialsSchema),

		initiate: _initiate,
		callback: _callback,
	};
};

export type ProviderAuthProvider = ReturnType<typeof providerAuth>;
