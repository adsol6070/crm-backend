"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonKnex = exports.config = void 0;
const knex_1 = require("knex");
const config = {
    common: {
        client: "pg",
        connection: {
            host: "127.0.0.1",
            user: "postgres",
            password: "admin",
            database: "tenants",
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
