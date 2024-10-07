import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "blogCategory",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.string("category").notNullable().unique();
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("blogCategory");
  } catch (error) {
    throw error;
  }
}
