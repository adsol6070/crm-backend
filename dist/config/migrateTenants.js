"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = require("knex");
const database_1 = require("./database");
const logger_1 = __importDefault(require("./logger"));
const migrateTenant = async (tenant, direction = "up", specificMigration = null) => {
    const tenantKnex = (0, knex_1.knex)({
        ...database_1.config.tenant,
        connection: {
            host: tenant.db_connection.host,
            user: tenant.db_connection.user,
            password: tenant.db_connection.password,
            database: tenant.db_connection.database,
        },
        migrations: {
            directory: "./src/migrations/tenant",
        },
    });
    try {
        logger_1.default.info(`Migrating tenant (${direction}): ${tenant.name}`);
        if (direction === "down") {
            if (specificMigration) {
                await tenantKnex.migrate.down({ name: specificMigration });
            }
            else {
                await tenantKnex.migrate.rollback();
            }
        }
        else {
            await tenantKnex.migrate.latest();
        }
        logger_1.default.info(`Migration completed for ${tenant.name}`);
    }
    catch (error) {
        console.error(`Failed to migrate ${tenant.name}: ${error.message}`);
    }
    finally {
        await tenantKnex.destroy();
    }
};
const runMigrations = async (direction = "up", specificMigration = null) => {
    try {
        const tenants = await (0, database_1.commonKnex)("tenants").where("active", true);
        for (const tenant of tenants) {
            await migrateTenant(tenant, direction, specificMigration);
        }
    }
    catch (error) {
        console.error(`Error running tenant migrations: ${error.message}`);
    }
    finally {
        await database_1.commonKnex.destroy();
    }
};
const direction = process.argv[2] === "down" ? "down" : "up";
const specificMigration = process.argv[3] || null;
runMigrations(direction, specificMigration);
