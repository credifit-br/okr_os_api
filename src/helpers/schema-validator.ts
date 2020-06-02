import * as Ajv from "ajv";
import { readFileSync } from "fs";
import { join } from "path";

const jsonSchema = JSON.parse(readFileSync(join(__dirname, "../generated/integrations.schema.json"), "utf8"));
const ajv = new Ajv();

ajv.addFormat("HH:MM", /^(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]$/u);

export function createValidator(name: string) {
  const validate = ajv.compile({ ...jsonSchema, ...jsonSchema.definitions?.[name] });

  return (value: unknown) => {
    if (!validate(value) && validate.errors) {
      throw new Error(validate.errors.map(err => `${err.dataPath} ${err.message}`).join(", "));
    }
  };
}
