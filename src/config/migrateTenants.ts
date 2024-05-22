import { knex } from "knex";
import { config, commonKnex } from "./database";
import logger from "./logger";

interface Tenant {
  tenantID: string;
  name: string;
  db_connection: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
}

const migrateTenant = async (
  tenant: Tenant,
  direction: "up" | "down" = "up",
  specificMigration: string | null = null,
): Promise<void> => {
  const tenantKnex = knex({
    ...config.tenant,
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
    logger.info(`Migrating tenant (${direction}): ${tenant.name}`);
    if (direction === "down") {
      if (specificMigration) {
        await tenantKnex.migrate.down({ name: specificMigration });
      } else {
        await tenantKnex.migrate.rollback();
      }
    } else {
      await tenantKnex.migrate.latest();
    }
    logger.info(`Migration completed for ${tenant.name}`);
  } catch (error) {
    console.error(
      `Failed to migrate ${tenant.name}: ${(error as Error).message}`,
    );
  } finally {
    await tenantKnex.destroy();
  }
};

const runMigrations = async (
  direction: "up" | "down" = "up",
  specificMigration: string | null = null,
): Promise<void> => {
  try {
    const tenants: Tenant[] = await commonKnex<Tenant>("tenants").where(
      "active",
      true,
    );
    for (const tenant of tenants) {
      await migrateTenant(tenant, direction, specificMigration);
    }
  } catch (error) {
    console.error(
      `Error running tenant migrations: ${(error as Error).message}`,
    );
  } finally {
    await commonKnex.destroy();
  }
};

const direction: "up" | "down" = process.argv[2] === "down" ? "down" : "up";
const specificMigration: string | null = process.argv[3] || null;

runMigrations(direction, specificMigration);
