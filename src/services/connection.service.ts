import { AsyncLocalStorage } from "async_hooks";
import knex, { Knex } from "knex";
import path from "path";
import logger from "../config/logger";
import { config, commonKnex } from "../config/database";

interface Tenant {
  tenantID?: string;
  name: string;
  db_connection: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
  active?: boolean;
}

const asyncLocalStorage = new AsyncLocalStorage<{ knex: Knex }>();
const tenantConnectionPools: Record<string, Knex> = {};

const isProduction = process.env.NODE_ENV === "production";

const getTenantKnex = (tenant: Tenant): Knex => {
  try {
    if (!tenantConnectionPools[tenant.name]) {
      logger.info(`Creating new connection pool for tenant: ${tenant.name}`);
      tenantConnectionPools[tenant.name] = knex({
        ...config.tenant,
        connection: {
          host: tenant.db_connection.host,
          user: tenant.db_connection.user,
          password: tenant.db_connection.password,
          database: tenant.db_connection.database,
        },
        migrations: {
          directory: path.join(
            __dirname,
            isProduction
              ? "../../dist/migrations/tenant"
              : "../migrations/tenant",
          ),
        },
        pool: { min: 2, max: 10 },
        acquireConnectionTimeout: 10000,
      });
    }
    return tenantConnectionPools[tenant.name];
  } catch (error) {
    logger.error(
      `Error creating Knex instance for tenant ${tenant.name}:`,
      error,
    );
    throw error;
  }
};

const cleanupTenantConnections = async (): Promise<void> => {
  try {
    const activeTenants = await commonKnex(
      <{ name: string }>(<unknown>"tenants"),
    )
      .where("active", true)
      .select("name");
    const activeTenantNames = new Set(activeTenants.map((t: any) => t.name));

    for (const tenantName in tenantConnectionPools) {
      if (!activeTenantNames.has(tenantName)) {
        logger.info(
          `Cleaning up connection pool for inactive tenant: ${tenantName}`,
        );
        await tenantConnectionPools[tenantName].destroy();
        delete tenantConnectionPools[tenantName];
      }
    }
  } catch (error) {
    logger.error("Error cleaning up tenant connections:", error);
  }
};

const runWithTenantContext = <T>(
  tenant: Tenant,
  callback: () => T,
): T | undefined => {
  const store = { knex: getTenantKnex(tenant) };
  return asyncLocalStorage.run(store, callback);
};

const getCurrentTenantKnex = (): Knex => {
  return asyncLocalStorage.getStore()?.knex as Knex;
};

export default {
  getTenantKnex,
  runWithTenantContext,
  getCurrentTenantKnex,
  cleanupTenantConnections,
};
