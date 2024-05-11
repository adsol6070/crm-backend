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
  JWT_ACCESS_SECRET: string;
  ACCESS_TOKEN_EXPIRY: number;
  REFRESH_TOKEN_EXPIRY: number;
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  EMAIL_FROM: string;
}

// Define the schema for validating environment variables
const envVarsSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(8000),
  DB_CLIENT: Joi.string().required().description("Database client"),
  DB_HOST: Joi.string().default("localhost").description("Database host"),
  DB_USER: Joi.string().required().description("Database user"),
  DB_PORT: Joi.number().default(5432).description("Database port"),
  DB_DATABASE: Joi.string().required().description("Database name"),
  DB_PASSWORD: Joi.string().required().description("Database password"),
  POSTGRES_ROLE: Joi.string().required().description("Postgres role"),
  REDIS_PORT: Joi.number().default(6379).description("Redis port"),
  REDIS_HOST: Joi.string().default("localhost").description("Redis host"),
  JWT_ACCESS_SECRET: Joi.string().required().description("JWT secret key"),
  ACCESS_TOKEN_EXPIRY: Joi.number()
    .required()
    .description("Seconds after which access token expires"),
  REFRESH_TOKEN_EXPIRY: Joi.number()
    .required()
    .description("Seconds after which refresh token expires"),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
    .default(300)
    .description("minutes after which reset password token expires"),
  SMTP_HOST: Joi.string().description("server that will send the emails"),
  SMTP_PORT: Joi.number().description("port to connect to the email server"),
  SMTP_USERNAME: Joi.string().description("username for email server"),
  SMTP_PASSWORD: Joi.string().description("password for email server"),
  EMAIL_FROM: Joi.string().description(
    "the from field in the emails sent by the app",
  ),
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
      host: envVars.DB_HOST,
      user: envVars.DB_USER,
      port: envVars.DB_PORT,
      database: envVars.DB_DATABASE,
      password: envVars.DB_PASSWORD,
    },
    pool: { min: 2, max: 10 },
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
  },
  jwt: {
    secret: envVars.JWT_ACCESS_SECRET,
    accessExpirationTime: envVars.ACCESS_TOKEN_EXPIRY,
    refreshExpirationTime: envVars.REFRESH_TOKEN_EXPIRY,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};

// Export the configuration object
export default config;
