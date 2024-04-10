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
    DB_USER: joi_1.default.string().required().description("Database user"),
    DB_PORT: joi_1.default.number().default(5432).description("Database port"),
    DB_HOST: joi_1.default.string().default("localhost").description("Database host"),
    DB_DATABASE: joi_1.default.string().required().description("Database name"),
    DB_PASSWORD: joi_1.default.string().required().description("Database password"),
    POSTGRES_ROLE: joi_1.default.string().required().description("Postgres role"),
    REDIS_PORT: joi_1.default.number().default(6379).description("Redis port"),
    REDIS_HOST: joi_1.default.string().default("localhost").description("Redis host"),
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
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT
    }
};
// Export the configuration object
exports.default = config;
