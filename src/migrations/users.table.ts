import { Knex } from "knex";
import logger from "../config/logger";

const createUsersTable = async (tenant: Knex): Promise<void> => {
  try {
    await tenant.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await tenant.schema.createTable(
      "users",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary().defaultTo(tenant.raw("uuid_generate_v4()"));
        table.uuid("tenantID").notNullable();
        table.string("firstname").notNullable();
        table.string("lastname").notNullable();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.string("phone").notNullable();
        table.string("profileImage");
        table.boolean("isEmailVerified").defaultTo(false);
        table.string("role").notNullable();
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    logger.error("Error creating user table:", error);
    throw error;
  }
};

export default createUsersTable;
