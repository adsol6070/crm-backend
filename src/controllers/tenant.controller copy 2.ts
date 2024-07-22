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

const createTenant = catchAsync(async (req: Request, res: Response) => {
  const { organization, subscriptionPlan } = req.body;

  if (!organization || typeof organization !== "string" || !subscriptionPlan) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Invalid input data" });
  }

  const tenantID = uuidv4();
  const username = `tenant_${organization.toLowerCase()}`;
  const password = generator.generate({ length: 12, numbers: true });
  const databaseName = `tenant_db_${organization.toLowerCase()}`;

  const dbConnection = {
    host: config.postgres.connection.host,
    user: username,
    password,
    database: databaseName,
  };

  // Run all migrations related to commonKnex first
  await commonKnex.migrate.latest();

  // Step 1: Create the tenant's database
  await commonKnex.raw(`CREATE DATABASE "${dbConnection.database}"`);

  // Step 2: Create the user for the tenant
  await commonKnex.raw(
    `CREATE USER "${dbConnection.user}" WITH ENCRYPTED PASSWORD '${dbConnection.password}'`,
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

  // Step 3: Set up permissions
  // Grant connect on the tenant database
  await commonKnex.raw(
    `GRANT CONNECT ON DATABASE "${dbConnection.database}" TO "${dbConnection.user}"`,
  );

  // Grant usage on the schema
  await superTenantKnex.raw(
    `GRANT USAGE ON SCHEMA public TO "${dbConnection.user}"`,
  );

  // Grant privileges on all tables in the public schema
  await superTenantKnex.raw(
    `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${dbConnection.user}"`,
  );

  // Grant privileges on all sequences in the public schema
  await superTenantKnex.raw(
    `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${dbConnection.user}"`,
  );

  // Grant privileges on the schema
  await superTenantKnex.raw(
    `GRANT ALL ON SCHEMA public TO "${dbConnection.user}"`,
  );

  // Alter default privileges to ensure all objects created by the superuser
  // are accessible by the tenant user
  await superTenantKnex.raw(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbConnection.user}";`,
  );

  // Insert the new tenant's configuration into the common 'tenants' table
  await commonKnex("tenants").insert({
    tenantID,
    name: organization,
    db_connection: JSON.stringify(dbConnection),
    active: true,
  });

  // Destroy the superuser connection to the tenant's database
  await superTenantKnex.destroy();

  // Connect using the tenant-specific configuration
  const tenantKnex = connectionService.getTenantKnex({
    tenantID,
    name: organization,
    db_connection: dbConnection,
  });

  // Run migrations for the tenant
  await tenantKnex.migrate.latest();

  res
    .status(httpStatus.CREATED)
    .json({ message: "Tenant created successfully", tenantID });
});

// const deleteTenant = catchAsync(async (req: Request, res: Response) => {
//   const { tenantName } = req.params;
//   const { password, uuid } = await db("tenants")
//     .select("db_password as password", "uuid")
//     .where({ db_name: tenantName })
//     .first();

//   await tenantService.down({ tenantName, password, uuid });

//   res
//     .status(httpStatus.NO_CONTENT)
//     .send({ message: "Tenant deleted successfully" });
// });

// const getTenants = catchAsync(async (req: Request, res: Response) => {
//   const tenants = await db("tenants").select("*");
//   res.status(httpStatus.OK).send(tenants);
// });

// const editTenant = catchAsync(async (req: Request, res: Response) => {
//   const { tenantId } = req.params;
//   const { newData } = req.body;
//   const modifiedBodyData = {
//     ...newData,
//     db_name: slugify(newData.db_name.toLowerCase(), "_"),
//   };
//   const getTenant = await db("tenants")
//     .select("*")
//     .where({ uuid: tenantId })
//     .first();
//   const updatedTenant = await tenantService.updateTenant(
//     { tenantId },
//     modifiedBodyData,
//     getTenant,
//   );
//   res.status(httpStatus.OK).send(updatedTenant);
// });

export default { createTenant /* deleteTenant, getTenants, editTenant */ };
