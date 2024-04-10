import bcrypt from "bcryptjs";
import { db } from "../config/databse";
import logger from "../config/logger";

const createTenantTable = async () => {
    db.schema
    .createTableIfNotExists("tenants", function (table) {
      table.uuid("uuid").primary();
      table.string("db_name").notNullable();
      table.string("db_username").notNullable();
      table.string("db_password").notNullable().unique();
      table.timestamps(true, true);
    })
    .then(() => {
      logger.info("Tenant table created successfully");
    })
    .catch((error) => {
      logger.error("Error creating user table:", error);
      throw error; // Terminate execution if table creation fails
    });
};

export default createTenantTable;
