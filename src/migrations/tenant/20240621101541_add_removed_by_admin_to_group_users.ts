import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_users",
      function (table: Knex.AlterTableBuilder) {
        table
          .boolean("removed_by_admin")
          .defaultTo(false)
          .after("disable_date");
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
        table.dropColumn("removed_by_admin");
      },
    );
  } catch (error) {
    throw error;
  }
}
