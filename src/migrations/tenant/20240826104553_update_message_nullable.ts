import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "messages",
      function (table: Knex.AlterTableBuilder) {
        table.text("message").nullable().alter();
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "messages",
      function (table: Knex.AlterTableBuilder) {
        table.text("message").notNullable().alter();
      },
    );
  } catch (error) {
    throw error;
  }
}
