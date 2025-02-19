import { z } from "zod";
import { resourceTypes } from "./types";

type Resource = z.infer<typeof resourceTypes>;

export type ResourceUri =
	| Partial<Record<z.infer<typeof resourceTypes>, string>>
	| {
			resource: Resource;
			id: string;
	  }[]
	| string;

/**
 * Creates a URI for a resource.
 *
 * The returned string is in format `resource1:id1;resource2:id2;...`.
 */
export const resourceUri = (resources: ResourceUri) => {
	let resourceArray: [string, string][] = [];

	if (typeof resources === "string") {
		if (resources.length === 0) {
			return "";
		}

		resourceArray = resources.split(";").map((resource) => {
			const [key, value] = resource.split(":");

			return [key, value];
		});
	} else if (Array.isArray(resources)) {
		resourceArray = resources.map((resource) => {
			return [resource.resource, resource.id];
		});
	} else {
		resourceArray = Object.entries(resources);
	}

	return resourceArray
		.filter(([key, value]) => {
			return key && value && key.length && value.length;
		})
		.map(([key, value]) => {
			const resource = resourceTypes.parse(key);
			const id = z.string().uuid().parse(value);

			return `${resource}:${id}`;
		})
		.join(";");
};

export const mergeResourceUris = (...uris: ResourceUri[]) => {
	return uris
		.map((uri) => resourceUri(uri))
		.filter((uri) => uri.length)
		.join(";");
};
