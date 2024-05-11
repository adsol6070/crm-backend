import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "tokens",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
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
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("tokens");
  } catch (error) {
    throw error;
  }
}
