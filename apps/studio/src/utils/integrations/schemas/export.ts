import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { indexingTask, processingTask } from "./definitions";

const schema = z.object({});

const jsonSchema = zodToJsonSchema(schema, {
	definitions: {
		indexingTask,
		processingTask,
	},
}) as {
	definitions: {
		indexingTask: {
			anyOf: { title: string; description: string; properties: { type: { const: string } } }[];
			discriminator: {
				propertyName: string;
			};
		};
	};
};

jsonSchema.definitions.indexingTask.discriminator = {
	propertyName: "type",
};

jsonSchema.definitions.indexingTask.anyOf.forEach((item, index) => {
	jsonSchema.definitions.indexingTask.anyOf[index].title =
		`${item.properties.type.const}:indexing:task`;
	jsonSchema.definitions.indexingTask.anyOf[index].description = `${item.properties.type.const}`;
});

console.log(JSON.stringify(jsonSchema, null, 2));
