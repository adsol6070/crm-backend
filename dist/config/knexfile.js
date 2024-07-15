"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const isProduction = process.env.NODE_ENV === "production";
const config = {
    common: {
        client: config_1.default.postgres.client,
        connection: {
            host: config_1.default.postgres.connection.host,
            user: config_1.default.postgres.connection.user,
            password: config_1.default.postgres.connection.password,
            database: config_1.default.postgres.connection.database,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: path_1.default.join(__dirname, isProduction ? "../../dist/migrations/common" : "../migrations/common"),
        },
    },
    tenant: {
        client: "pg",
        connection: {
            host: "your-tenant-db-host",
            user: "your-user",
            password: "your-password",
            database: "template-tenant-db",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: path_1.default.join(__dirname, isProduction ? "../../dist/migrations/tenant" : "../migrations/tenant"),
        },
    },
};
module.exports = config;
