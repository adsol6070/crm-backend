import bcrypt from "bcryptjs";
import { db } from "../config/databse";
import logger from "../config/logger";

const createUserModel = async () => {
  try {
    const tableExists = await db.schema.hasTable("users");
    if (!tableExists) {
      await db.schema.createTable("tenants", function (table) {
        table.uuid("uuid").primary();
        table.uuid("tenantid");
        table.string("firstname").notNullable();
        table.string("lastname").notNullable();
        table.string("password").notNullable();
        table.string("email").notNullable().unique();
        table.timestamps(true, true);
      });
      logger.info("User table created successfully");
    }
  } catch (error) {
    logger.error("Error creating User table:", error);
    throw error;
  }
};

export default createUserModel;
