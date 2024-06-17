import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_messages",
      function (table: Knex.AlterTableBuilder) {
        table.jsonb("read_by").defaultTo([]);
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
        table.dropColumn("read_by");
      },
    );
  } catch (error) {
    throw error;
  }
}
