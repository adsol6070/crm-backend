import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_messages",
      function (table: Knex.AlterTableBuilder) {
        table.boolean("read").defaultTo(false);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_messages",
      function (table: Knex.AlterTableBuilder) {
        table.dropColumn("read");
      },
    );
  } catch (error) {
    throw error;
  }
}
