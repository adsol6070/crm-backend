import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_messages",
      function (table: Knex.AlterTableBuilder) {
        table.text("file_url").nullable();
        table.string("file_type").nullable();
        table.string("file_name").nullable();
        table.string("file_size").nullable();
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
        table.dropColumn("file_url");
        table.dropColumn("file_type");
        table.dropColumn("file_name");
        table.dropColumn("file_size");
      },
    );
  } catch (error) {
    throw error;
  }
}
