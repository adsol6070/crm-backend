import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { v4 as uuidv4 } from "uuid";
import generator from "generate-password";
import slugify from "slugify";
import { commonKnex } from "../config/database";
import { connectionService, tenantService } from "../services";
import { Request, Response } from "express";
import knex from "knex";

// const createTenant = catchAsync(async (req: Request, res: Response) => {
//   const { organization } = req.body;

//   const tenantName = slugify(organization.toLowerCase(), "_");
//   const password = generator.generate({ length: 12, numbers: true });
//   const uuid = uuidv4();
//   const tenant = {
//     uuid,
//     db_name: tenantName,
//     db_username: tenantName,
//     db_password: password,
//   };
//   await db("tenants").insert(tenant);
//   await tenantService.up({ tenantName, password, uuid });
//   res.status(httpStatus.OK).send({ tenant: { ...tenant } });
// });

const createTenant = catchAsync(async (req: Request, res: Response) => {
  const { organization } = req.body;
  const tenantID = uuidv4();
  const username = `tenant_${organization.toLowerCase()}`;
  const password = generator.generate({ length: 12, numbers: true });
  const databaseName = `tenant_db_${organization.toLowerCase()}`;

  const dbConnection = {
    host: process.env.DB_HOST || "localhost",
    user: username,
    password,
    database: databaseName,
  };

  // Step 1: Create the tenant's database
  await commonKnex.raw(`CREATE DATABASE "${dbConnection.database}"`);

  // Step 2: Create the user for the tenant
  await commonKnex.raw(
    `CREATE USER "${dbConnection.user}" WITH ENCRYPTED PASSWORD '${dbConnection.password}'`,
  );

  // Connect to the tenant's database as a superuser
  const superTenantKnex = knex({
    client: "pg",
    connection: {
      host: dbConnection.host,
      user: process.env.DB_SUPERUSER || "postgres",
      password: "admin",
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
    .json({ message: "Tenant created successfully", dbConnection });
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
