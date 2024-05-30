import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "groups",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.string("name", 255).notNullable();
        table
          .uuid("creator_id")
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("groups");
  } catch (error) {
    throw error;
  }
}
