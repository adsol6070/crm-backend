import { knex } from 'knex';
import { config, commonKnex } from './database';
import logger from './logger';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

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

const readdir = promisify(fs.readdir);

const seedTenant = async (tenant: Tenant): Promise<void> => {
  const tenantKnex = knex({
    ...config.tenant,
    connection: {
      host: tenant.db_connection.host,
      user: tenant.db_connection.user,
      password: tenant.db_connection.password,
      database: tenant.db_connection.database,
    },
    seeds: {
      directory: path.resolve(__dirname, '../seeds/tenant'),
    },
  });

  try {
    logger.info(`Seeding data for tenant: ${tenant.name}`);

    const seedDirectory = path.resolve(__dirname, '../seeds/tenant');
    const files = await readdir(seedDirectory);

    // Track executed seeds
    const executedSeeds = await tenantKnex('seed_tracking')
      .where('tenant_id', tenant.tenantID)
      .select('script_name');

    const executedSeedNames = new Set(executedSeeds.map(row => row.script_name));

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const scriptName = path.basename(file, path.extname(file));

        // Check if the script has already been executed
        if (executedSeedNames.has(scriptName)) {
          logger.info(`Skipping already executed seed script: ${file}`);
          continue;
        }

        const seed = require(path.join(seedDirectory, file));
        if (typeof seed.seed === 'function') {
          await seed.seed(tenantKnex);

          // Record script execution
          await tenantKnex('seed_tracking').insert({
            tenant_id: tenant.tenantID,
            script_name: scriptName,
          });
          logger.info(`Executed seed script: ${file}`);
        }
      }
    }

    logger.info(`Seeding completed for ${tenant.name}`);
  } catch (error) {
    logger.error(`Failed to seed data for ${tenant.name}: ${(error as Error).message}`);
  } finally {
    await tenantKnex.destroy();
  }
};

const runSeeds = async (): Promise<void> => {
  try {
    const tenants: Tenant[] = await commonKnex<Tenant>('tenants').where('active', true);
    for (const tenant of tenants) {
      await seedTenant(tenant);
    }
  } catch (error) {
    logger.error(`Error running tenant seeds: ${(error as Error).message}`);
  } finally {
    await commonKnex.destroy();
  }
};

runSeeds();
