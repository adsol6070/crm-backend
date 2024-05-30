import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "group_users",
      function (table: Knex.CreateTableBuilder) {
        table
          .uuid("group_id")
          .references("id")
          .inTable("groups")
          .onDelete("CASCADE");
        table
          .uuid("user_id")
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.primary(["group_id", "user_id"]);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("group_users");
  } catch (error) {
    throw error;
  }
}
