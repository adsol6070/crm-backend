"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonKnex = exports.config = void 0;
const knex_1 = require("knex");
const config_1 = __importDefault(require("./config"));
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
            directory: "../migrations/common",
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
            directory: "../migrations/tenant",
        },
    },
};
exports.config = config;
const commonKnex = (0, knex_1.knex)(config.common);
exports.commonKnex = commonKnex;
