import bcrypt from "bcryptjs";
import { db } from "../config/databse";
import logger from "../config/logger";

const createTenantTable = async () => {
  try {
    const tableExists = await db.schema.hasTable("tenants");
    if (!tableExists) {
      await db.schema.createTable("tenants", function (table) {
        table.uuid("uuid").primary();
        table.string("db_name").notNullable();
        table.string("db_username").notNullable();
        table.string("db_password").notNullable().unique();
        table.timestamps(true, true);
      });
      logger.info("Tenant table created successfully");
    }
  } catch (error) {
    logger.error("Error creating tenant table:", error);
    throw error;
  }
};

export default createTenantTable;
