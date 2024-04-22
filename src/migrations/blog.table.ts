import { Knex } from "knex";
import logger from "../config/logger";

const createBlogsTable = async (tenant: Knex): Promise<void> => {
  try {
    await tenant.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await tenant.schema.createTable(
      "blogs",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary().defaultTo(tenant.raw("uuid_generate_v4()"));
        table.uuid("tenantID").notNullable();
        table.string("title").notNullable();
        table.string("content").notNullable();
        table.string("category").notNullable();
        table.string("blogImage");
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    logger.error("Error creating blog table:", error);
    throw error;
  }
};

export default createBlogsTable;
