import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("todoTask", (table) => {
    table.uuid("id").primary();
    table.uuid("tenantID").notNullable();
    table
      .uuid("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("board_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("todoBoard")
      .onDelete("CASCADE");
    table.string("taskStatus");
    table.string("taskTitle").notNullable();
    table.text("taskDescription");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("todoTask");
}
