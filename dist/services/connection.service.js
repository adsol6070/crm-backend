"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_hooks_1 = require("async_hooks");
const knex_1 = __importDefault(require("knex"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../config/logger"));
const database_1 = require("../config/database");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
const tenantConnectionPools = {};
const isProduction = process.env.NODE_ENV === "production";
const getTenantKnex = (tenant) => {
    try {
        if (!tenantConnectionPools[tenant.name]) {
            logger_1.default.info(`Creating new connection pool for tenant: ${tenant.name}`);
            tenantConnectionPools[tenant.name] = (0, knex_1.default)({
                ...database_1.config.tenant,
                connection: {
                    host: tenant.db_connection.host,
                    user: tenant.db_connection.user,
                    password: tenant.db_connection.password,
                    database: tenant.db_connection.database,
                },
                migrations: {
                    directory: path_1.default.join(__dirname, isProduction
                        ? "../../dist/migrations/tenant"
                        : "../migrations/tenant"),
                },
                pool: { min: 2, max: 10 },
                acquireConnectionTimeout: 10000,
            });
        }
        return tenantConnectionPools[tenant.name];
    }
    catch (error) {
        logger_1.default.error(`Error creating Knex instance for tenant ${tenant.name}:`, error);
        throw error;
    }
};
const cleanupTenantConnections = async () => {
    try {
        const activeTenants = await (0, database_1.commonKnex)("tenants")
            .where("active", true)
            .select("name");
        const activeTenantNames = new Set(activeTenants.map((t) => t.name));
        for (const tenantName in tenantConnectionPools) {
            if (!activeTenantNames.has(tenantName)) {
                logger_1.default.info(`Cleaning up connection pool for inactive tenant: ${tenantName}`);
                await tenantConnectionPools[tenantName].destroy();
                delete tenantConnectionPools[tenantName];
            }
        }
    }
    catch (error) {
        logger_1.default.error("Error cleaning up tenant connections:", error);
    }
};
const runWithTenantContext = (tenant, callback) => {
    const store = { knex: getTenantKnex(tenant) };
    return asyncLocalStorage.run(store, callback);
};
const getCurrentTenantKnex = () => {
    return asyncLocalStorage.getStore()?.knex;
};
const createCommonDatabase = async () => {
    const initialKnex = (0, knex_1.default)({
        client: "pg",
        connection: {
            ...database_1.config.common.connection,
            password: database_1.config.common.connection.password,
            database: "postgres",
        },
    });
    try {
        const dbExists = await initialKnex.raw(`SELECT 1 FROM pg_database WHERE datname = ?;`, [database_1.config.common.connection.database]);
        if (!dbExists.rows.length) {
            await initialKnex.raw(`CREATE DATABASE ??`, [
                database_1.config.common.connection.database,
            ]);
            logger_1.default.info(`Database ${database_1.config.common.connection.database} created successfully.`);
        }
        else {
            logger_1.default.info(`Database ${database_1.config.common.connection.database} already exists.`);
        }
    }
    catch (error) {
        logger_1.default.error(`Error creating common database: ${error}`);
    }
    finally {
        await initialKnex.destroy();
    }
};
exports.default = {
    getTenantKnex,
    runWithTenantContext,
    getCurrentTenantKnex,
    cleanupTenantConnections,
    createCommonDatabase,
};
