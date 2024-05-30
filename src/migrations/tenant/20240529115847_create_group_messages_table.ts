import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "group_messages",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table
          .uuid("group_id")
          .references("id")
          .inTable("groups")
          .onDelete("CASCADE");
        table
          .uuid("from_user_id")
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.text("message").notNullable();
        table.timestamp("timestamp").defaultTo(knex.fn.now());
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("group_messages");
  } catch (error) {
    throw error;
  }
}
