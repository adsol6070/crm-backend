import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "visaCategory",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.string("category").notNullable().unique();
        table.timestamps(true, true);
      },
    );
    await knex.raw(`
      ALTER TABLE visaCategory
      ADD CONSTRAINT category_lowercase_check
      CHECK (category ~ '^[a-z_]+$');
    `);
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("visaCategory");
  } catch (error) {
    throw error;
  }
}
