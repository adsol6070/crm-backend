"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
const path_1 = __importDefault(require("path"));
// Load environment variables based on the NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? "env.production" : "env.development";
dotenv_1.default.config({ path: path_1.default.join(__dirname, `../../.${envFile}`) });
// Define the schema for validating environment variables
const envVarsSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid("production", "development", "test").required(),
    PORT: joi_1.default.number().default(8000),
    DB_CLIENT: joi_1.default.string().required().description("Database client"),
    DB_HOST: joi_1.default.string().default("localhost").description("Database host"),
    DB_USER: joi_1.default.string().required().description("Database user"),
    DB_PORT: joi_1.default.number().default(5432).description("Database port"),
    DB_DATABASE: joi_1.default.string().required().description("Database name"),
    DB_PASSWORD: joi_1.default.string().required().description("Database password"),
    POSTGRES_ROLE: joi_1.default.string().required().description("Postgres role"),
    REDIS_PORT: joi_1.default.number().default(6379).description("Redis port"),
    REDIS_HOST: joi_1.default.string().default("localhost").description("Redis host"),
    JWT_ACCESS_SECRET: joi_1.default.string().required().description("JWT secret key"),
    ACCESS_TOKEN_EXPIRY: joi_1.default.number()
        .required()
        .description("Seconds after which access token expires"),
    REFRESH_TOKEN_EXPIRY: joi_1.default.number()
        .required()
        .description("Seconds after which refresh token expires"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: joi_1.default.number()
        .default(300)
        .description("minutes after which reset password token expires"),
    SMTP_HOST: joi_1.default.string().description("server that will send the emails"),
    SMTP_PORT: joi_1.default.number().description("port to connect to the email server"),
    SMTP_USERNAME: joi_1.default.string().description("username for email server"),
    SMTP_PASSWORD: joi_1.default.string().description("password for email server"),
    EMAIL_FROM: joi_1.default.string().description("the from field in the emails sent by the app"),
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
        resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
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
exports.default = config;
