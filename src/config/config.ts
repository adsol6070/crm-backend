import dotenv from "dotenv";
import Joi from "joi";
import path from "path";

// Load environment variables based on the NODE_ENV
const envFile =
  process.env.NODE_ENV === "production" ? "env.production" : "env.development";
dotenv.config({ path: path.join(__dirname, `../../.${envFile}`) });

// Define the expected environment variables and their types
interface EnvironmentVariables {
  NODE_ENV: "production" | "development" | "test";
  PORT: number;
  MONGODB_URL: string;
}

// Define the schema for validating environment variables
const envVarsSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(8000),
  MONGODB_URL: Joi.string().required().description("Mongo DB URL"),
}).unknown();

// Validate and extract environment variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

// Throw an error if validation fails
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Create the configuration object
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
};

// Export the configuration object
export default config;
