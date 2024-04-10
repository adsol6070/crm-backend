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
  DB_CLIENT: string;
  DB_USER: string;
  DB_PORT: number;
  DB_HOST: string;
  DB_DATABASE: string;
  DB_PASSWORD: string;
  POSTGRES_ROLE: string;
  REDIS_PORT: number;
  REDIS_HOST: string;
}

// Define the schema for validating environment variables
const envVarsSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(8000),
  DB_CLIENT: Joi.string().required().description("Database client"),
  DB_USER: Joi.string().required().description("Database user"),
  DB_PORT: Joi.number().default(5432).description("Database port"),
  DB_HOST: Joi.string().default("localhost").description("Database host"),
  DB_DATABASE: Joi.string().required().description("Database name"),
  DB_PASSWORD: Joi.string().required().description("Database password"),
  POSTGRES_ROLE: Joi.string().required().description("Postgres role"),
  REDIS_PORT: Joi.number().default(6379).description("Redis port"),
  REDIS_HOST: Joi.string().default("localhost").description("Redis host"),
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
  postgres: {
    client: envVars.DB_CLIENT,
    connection: {
      user: envVars.DB_USER,
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      database: envVars.DB_DATABASE,
      password: envVars.DB_PASSWORD
    },
    pool: { min: 2, max: 10 }
  },
  redis:{
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT
  }
};

// Export the configuration object
export default config;
