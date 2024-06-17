import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_users",
      function (table: Knex.AlterTableBuilder) {
        table.timestamp("disable_date").nullable();
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
        table.dropColumn("disable_date");
      },
    );
  } catch (error) {
    throw error;
  }
}
