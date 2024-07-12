import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table(
      "group_messages",
      function (table: Knex.AlterTableBuilder) {
        table
          .uuid("excluded_user_id")
          .nullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
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
        table.dropColumn("excluded_user_id");
      },
    );
  } catch (error) {
    throw error;
  }
}
