"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
module.exports = config;
