import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_users",
      function (table: Knex.AlterTableBuilder) {
        table.boolean("is_active").defaultTo(true).notNullable();
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_users",
      function (table: Knex.AlterTableBuilder) {
        table.dropColumn("is_active");
      },
    );
  } catch (error) {
    throw error;
  }
}
