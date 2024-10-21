import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "permissions",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.string("role").notNullable().unique();
        table.json("permissions").notNullable();
        table.timestamps(true, true);
      },
    );

    await knex.raw(`
      ALTER TABLE permissions
      ADD CONSTRAINT role_lowercase_check
      CHECK (role ~ '^[a-z_]+$');
    `);
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
