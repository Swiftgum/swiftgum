import { z } from "zod";

export const storedToken = z.object({
	tokenId: z.string().uuid(),
});
