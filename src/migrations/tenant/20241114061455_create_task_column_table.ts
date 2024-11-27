import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("todoTaskColumn", (table) => {
    table.uuid("id").primary();
    table.uuid("tenantID").notNullable();
    table
      .uuid("board_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("todoBoard")
      .onDelete("CASCADE");
    table.jsonb("taskStatus");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("todoTaskColumn");
}
