import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "permissions",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.string("role").notNullable();
        table.json("permissions").notNullable();
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("permissions");
  } catch (error) {
    throw error;
  }
}
