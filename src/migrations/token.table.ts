import { Knex } from "knex";
import logger from "../config/logger";

const createTokenTable = async (tenant: Knex): Promise<void> => {
  try {
    await tenant.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await tenant.schema.createTable(
      "tokens",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary().defaultTo(tenant.raw("uuid_generate_v4()"));
        table.uuid("tenantID").notNullable();
        table.uuid("user");
        table.foreign("user").references("users.id");
        table.text("token").notNullable();
        table.string("expires").notNullable();
        table.string("type").notNullable();
        table.boolean("blacklisted").defaultTo(false);
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    logger.error("Error creating token table:", error);
    throw error;
  }
};

export default createTokenTable;
