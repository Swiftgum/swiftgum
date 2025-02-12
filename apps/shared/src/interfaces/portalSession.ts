import { z } from "zod";

export const portalSessionConfiguration = z.object({
	userDisplay: z.string(),
	returnUrl: z.string(),
	appName: z.string(),
	backgroundColor: z
		.string()
		.optional()
		.refine(
			(color) => {
				if (!color) return true;
				return /^#([0-9a-fA-F]{6})$/.test(color);
			},
			{
				message: "Invalid color",
			},
		),
});

export type PortalSessionConfiguration = z.infer<typeof portalSessionConfiguration>;
