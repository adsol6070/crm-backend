import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "blogs",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.text("title").notNullable();
        table.text("content").notNullable();
        table.text("description").notNullable();
        table.text("category").notNullable();
        table.string("blogImage");
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("blogs");
  } catch (error) {
    throw error;
  }
}
