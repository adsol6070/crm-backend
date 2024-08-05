import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { v4 as uuidv4 } from "uuid";
import generator from "generate-password";
import slugify from "slugify";
import { commonKnex } from "../config/database";
import { connectionService, tenantService } from "../services";
import { Request, Response } from "express";
import knex from "knex";
import config from "../config/config";
import logger from "../config/logger";

const createTenant = catchAsync(async (req: Request, res: Response) => {
  const { organization, subscriptionPlan, phoneNumber, address } = req.body;

  if (!organization || typeof organization !== "string" || !subscriptionPlan) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Invalid input data" });
  }

  const tenantID = uuidv4();
  const username = `tenant_${organization.toLowerCase().replace(/\s+/g, "_")}`;
  const password = generator.generate({ length: 12, numbers: true });
  const databaseName = `tenant_db_${organization.toLowerCase().replace(/\s+/g, "_")}`;

  const dbConnection = {
    host: config.postgres.connection.host,
    user: username,
    password,
    database: databaseName,
  };

  try {
    const [completedMigrations, pendingMigrations] =
      await commonKnex.migrate.list();

    if (pendingMigrations.length > 0) {
      logger.info(
        `Pending migrations found: ${pendingMigrations.length}. Running migrations...`,
      );
      await commonKnex.migrate.latest();
      logger.info("Common database migrations ran successfully.");
    } else {
      logger.info("No pending migrations found.");
    }

    // Create the tenant's database outside of the transaction
    await commonKnex.raw(`CREATE DATABASE "${dbConnection.database}"`);
    logger.info(`Database ${dbConnection.database} created successfully`);

    // Create the user for the tenant
    await commonKnex.raw(
      `CREATE USER "${dbConnection.user}" WITH ENCRYPTED PASSWORD '${dbConnection.password}'`,
    );
    logger.info(`User ${dbConnection.user} created successfully`);

    // Start a transaction for setting up permissions and inserting tenant data
    const trx = await commonKnex.transaction();

    try {
      // Grant connect on the tenant database
      await trx.raw(
        `GRANT CONNECT ON DATABASE "${dbConnection.database}" TO "${dbConnection.user}"`,
      );

      // Connect to the tenant's database as a superuser
      const superTenantKnex = knex({
        client: config.postgres.client,
        connection: {
          host: dbConnection.host,
          user: config.postgres.connection.user,
          password: config.postgres.connection.password,
          database: dbConnection.database,
        },
      });

      // Set up permissions
      await superTenantKnex.raw(
        `GRANT USAGE ON SCHEMA public TO "${dbConnection.user}"`,
      );
      await superTenantKnex.raw(
        `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${dbConnection.user}"`,
      );
      await superTenantKnex.raw(
        `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${dbConnection.user}"`,
      );
      await superTenantKnex.raw(
        `GRANT ALL ON SCHEMA public TO "${dbConnection.user}"`,
      );
      await superTenantKnex.raw(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbConnection.user}";`,
      );

      // Insert the new tenant's configuration into the common 'tenants' table
      await trx("tenants").insert({
        tenantID,
        name: organization,
        db_connection: JSON.stringify(dbConnection),
        active: true,
        subscriptionPlan,
        address,
        phoneNumber,
      });

      // Commit the transaction
      await trx.commit();

      // Destroy the superuser connection to the tenant's database
      await superTenantKnex.destroy();

      const tenantKnex = connectionService.getTenantKnex({
        tenantID,
        name: organization,
        db_connection: dbConnection,
      });

      process.env.TENANT_ID = tenantID;

      await tenantKnex.migrate.latest();
      await tenantKnex.seed.run();

      logger.info(
        `Tenant ${organization} created successfully with ID: ${tenantID}`,
      );
      res
        .status(httpStatus.CREATED)
        .json({ message: "Tenant created successfully", tenantID });
    } catch (error: any) {
      // Roll back the transaction in case of an error
      await trx.rollback();
      logger.error(`Failed to create tenant: ${error.message}`);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to create tenant", error: error.message });
    }
  } catch (error: any) {
    logger.error(`Failed to create tenant database or user: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create tenant database or user",
      error: error.message,
    });
  }
});

const toggleTenant = async (req: Request, res: Response) => {
  console.log(req.body);
  const { tenantID, active } = req.body;

  console.table({ TenantID: tenantID, Active: active });

  if (!tenantID) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Tenant ID is required" });
  }

  if (active === undefined) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Active status is required" });
  }

  const trx = await commonKnex.transaction();

  try {
    const tenant = await trx("tenants").where({ tenantID }).first();

    if (!tenant) {
      await trx.rollback();
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Tenant not found" });
    }

    const dbConnection = tenant.db_connection;

    if (active) {
      // Enable tenant
      await trx.raw(
        `GRANT CONNECT ON DATABASE "${dbConnection.database}" TO "${dbConnection.user}"`,
      );
      await trx.raw(`ALTER USER "${dbConnection.user}" WITH LOGIN`);

      await trx("tenants").where({ tenantID }).update({
        active: true,
        deactivated_at: null, // Clear deactivated_at if reactivating
      });

      logger.info(
        `Tenant ${tenant.name} (ID: ${tenantID}) enabled successfully`,
      );
      res
        .status(httpStatus.OK)
        .json({ message: "Tenant enabled successfully" });
    } else {
      // Disable tenant
      await trx.raw(
        `REVOKE CONNECT ON DATABASE "${dbConnection.database}" FROM "${dbConnection.user}"`,
      );
      await trx.raw(`ALTER USER "${dbConnection.user}" WITH NOLOGIN`);

      await trx("tenants").where({ tenantID }).update({
        active: false,
        deactivated_at: new Date(),
      });

      logger.info(
        `Tenant ${tenant.name} (ID: ${tenantID}) disabled successfully`,
      );
      res
        .status(httpStatus.OK)
        .json({ message: "Tenant disabled successfully" });
    }

    await trx.commit();
  } catch (error: any) {
    await trx.rollback();
    logger.error(`Failed to toggle tenant status: ${error.message}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to toggle tenant status",
      error: error.message,
    });
  }
};

const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await commonKnex("tenants").select("*");
    const formattedTenants = tenants.map((tenant) => ({
      organizationID: tenant.tenantID,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phoneNumber,
      plan: tenant.subscriptionPlan,
      dbname: tenant.db_connection.database,
      dbpassword: tenant.db_connection.password,
      active: tenant.active,
      created_at: tenant.created_at,
      deactivated_at: tenant.deactivated_at,
    }));
    res.status(httpStatus.OK).json(formattedTenants);
  } catch (error: any) {
    logger.error(`Failed to fetch tenants: ${error.message}`);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch tenants", error: error.message });
  }
};

const getSuperusers = async (req: Request, res: Response) => {
  try {
    const superUsers = await commonKnex("users").select("*");
    const formattedSuperUsrers = superUsers.map((superUser) => ({
      id: superUser.id,
      organizationID: superUser.tenantID,
      superUserEmail: superUser.email,
      created_at: superUser.created_at,
    }));
    res.status(httpStatus.OK).json(formattedSuperUsrers);
  } catch (error: any) {
    logger.error(`Failed to fetch superUsers: ${error.message}`);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch superUsers", error: error.message });
  }
};

const deleteTenant = catchAsync(async (req: Request, res: Response) => {
  const { tenantID } = req.params;

  if (!tenantID) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Tenant ID is required" });
  }

  try {
    const tenant = await commonKnex('tenants').where({ tenantID }).first();

    if (!tenant) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Tenant not found" });
    }

    const dbConnection = tenant.db_connection;
    const { database, user } = dbConnection;

    const trx = await commonKnex.transaction();

    try {
      const superTenantKnex = knex({
        client: config.postgres.client,
        connection: {
          host: dbConnection.host,
          user: config.postgres.connection.user,
          password: config.postgres.connection.password,
          database: dbConnection.database,
        },
      });

      const schemaExists = await superTenantKnex.raw(`SELECT 1 FROM pg_namespace WHERE nspname = 'public'`);
      if (schemaExists.rowCount > 0) {
        await superTenantKnex.raw('DROP SCHEMA public CASCADE');
        await superTenantKnex.raw('CREATE SCHEMA public');
        logger.info(`Dropped all tables and sequences in ${database}`);
      } else {
        logger.warn(`Schema public does not exist in ${database}`);
      }

      await superTenantKnex.destroy();

      await commonKnex.raw(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '${database}'
          AND pid <> pg_backend_pid();
      `);
      logger.info(`Terminated active connections to ${database}`);

      await commonKnex.raw(`DROP DATABASE IF EXISTS "${database}"`);
      logger.info(`Database ${database} deleted successfully`);

      await commonKnex.raw(`DROP USER IF EXISTS "${user}"`);
      logger.info(`User ${user} deleted successfully`);

      await trx('tenants').where({ tenantID }).del();

      await trx.commit();

      logger.info(`Tenant ${tenant.name} deleted successfully with ID: ${tenantID}`);
      res.status(httpStatus.OK).json({ message: "Tenant deleted successfully", tenantID });
    } catch (error: any) {
      await trx.rollback();
      logger.error(`Failed to delete tenant database or user: ${JSON.stringify(error)}`);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to delete tenant database or user", error: error.message });
    }
  } catch (error: any) {
    logger.error(`Failed to fetch tenant or initiate transaction: ${JSON.stringify(error)}`);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete tenant",
      error: error.message,
    });
  }
});

export default {
  createTenant,
  // disableTenant,
  toggleTenant,
  getTenants,
  getSuperusers,
  deleteTenant,
};
