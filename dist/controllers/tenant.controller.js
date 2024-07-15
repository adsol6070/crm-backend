"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const uuid_1 = require("uuid");
const generate_password_1 = __importDefault(require("generate-password"));
const database_1 = require("../config/database");
const services_1 = require("../services");
const knex_1 = __importDefault(require("knex"));
const config_1 = __importDefault(require("../config/config"));
const createTenant = (0, catchAsync_1.default)(async (req, res) => {
    const { organization } = req.body;
    const tenantID = (0, uuid_1.v4)();
    const username = `tenant_${organization.toLowerCase()}`;
    const password = generate_password_1.default.generate({ length: 12, numbers: true });
    const databaseName = `tenant_db_${organization.toLowerCase()}`;
    const dbConnection = {
        host: config_1.default.postgres.connection.host,
        user: username,
        password,
        database: databaseName,
    };
    // Run all migrations related to commonKnex first
    await database_1.commonKnex.migrate.latest();
    // Step 1: Create the tenant's database
    await database_1.commonKnex.raw(`CREATE DATABASE "${dbConnection.database}"`);
    // Step 2: Create the user for the tenant
    await database_1.commonKnex.raw(`CREATE USER "${dbConnection.user}" WITH ENCRYPTED PASSWORD '${dbConnection.password}'`);
    // Connect to the tenant's database as a superuser
    const superTenantKnex = (0, knex_1.default)({
        client: config_1.default.postgres.client,
        connection: {
            host: dbConnection.host,
            user: config_1.default.postgres.connection.user,
            password: config_1.default.postgres.connection.password,
            database: dbConnection.database,
        },
    });
    // Step 3: Set up permissions
    // Grant connect on the tenant database
    await database_1.commonKnex.raw(`GRANT CONNECT ON DATABASE "${dbConnection.database}" TO "${dbConnection.user}"`);
    // Grant usage on the schema
    await superTenantKnex.raw(`GRANT USAGE ON SCHEMA public TO "${dbConnection.user}"`);
    // Grant privileges on all tables in the public schema
    await superTenantKnex.raw(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${dbConnection.user}"`);
    // Grant privileges on all sequences in the public schema
    await superTenantKnex.raw(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${dbConnection.user}"`);
    // Grant privileges on the schema
    await superTenantKnex.raw(`GRANT ALL ON SCHEMA public TO "${dbConnection.user}"`);
    // Alter default privileges to ensure all objects created by the superuser
    // are accessible by the tenant user
    await superTenantKnex.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${dbConnection.user}";`);
    // Insert the new tenant's configuration into the common 'tenants' table
    await (0, database_1.commonKnex)("tenants").insert({
        tenantID,
        name: organization,
        db_connection: JSON.stringify(dbConnection),
        active: true,
    });
    // Destroy the superuser connection to the tenant's database
    await superTenantKnex.destroy();
    // Connect using the tenant-specific configuration
    const tenantKnex = services_1.connectionService.getTenantKnex({
        tenantID,
        name: organization,
        db_connection: dbConnection,
    });
    // Run migrations for the tenant
    await tenantKnex.migrate.latest();
    res
        .status(http_status_1.default.CREATED)
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
exports.default = { createTenant /* deleteTenant, getTenants, editTenant */ };
