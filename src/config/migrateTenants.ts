import { knex } from "knex";
import { config, commonKnex } from "./database";
import logger from "./logger";
import path from "path";

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

const isProduction = process.env.NODE_ENV === "production";

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
      directory: path.join(
        __dirname,
        isProduction ? "../../dist/migrations/tenant" : "../migrations/tenant",
      ),
    },
  });

  try {
    logger.info(`Migrating tenant (${direction}): ${tenant.name}`);
    if (direction === "down") {
      if (specificMigration) {
        const [completedMigrations, pendingMigrations] =
          await tenantKnex.migrate.list();

        const migrationToRollback = completedMigrations.find(
          (mig: any) => mig.name === specificMigration,
        );

        if (migrationToRollback) {
          await tenantKnex.migrate.down({ name: specificMigration });
          logger.info(
            `Migration ${specificMigration} rolled back successfully for ${tenant.name}.`,
          );
        } else {
          logger.info(
            `Migration ${specificMigration} has not been applied or already rolled back for ${tenant.name}.`,
          );
        }
      } else {
        await tenantKnex.migrate.rollback();
      }
    } else {
      if (specificMigration) {
        const [completedMigrations, pendingMigrations] =
          await tenantKnex.migrate.list();

        const migrationToApply = pendingMigrations.find(
          (mig: any) => mig.file === specificMigration,
        );

        if (migrationToApply) {
          await tenantKnex.migrate.up({ name: specificMigration });
          logger.info(
            `Migration ${specificMigration} applied successfully for ${tenant.name}.`,
          );
        } else {
          logger.info(
            `Migration ${specificMigration} is not pending or already applied for ${tenant.name}.`,
          );
        }
      } else {
        await tenantKnex.migrate.latest();
      }
    }
  } catch (error) {
    logger.error(
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
