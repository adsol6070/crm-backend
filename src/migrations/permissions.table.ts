import { Knex } from "knex";
import logger from "../config/logger";

const createPermissionsTables = async (tenant: Knex): Promise<void> => {
  try {
    await tenant.schema.createTable(
      "permissions",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary().defaultTo(tenant.raw("uuid_generate_v4()"));
        table.string("role").notNullable();
        table.json("permissions").notNullable();
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    logger.error("Error creating permissions tables:", error);
    throw error;
  }
};

export default createPermissionsTables;
