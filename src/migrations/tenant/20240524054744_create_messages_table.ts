import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "messages",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("fromUserId").notNullable();
        table.uuid("toUserId").notNullable();
        table.text("message").notNullable();
        table.timestamp("timestamp").defaultTo(knex.fn.now());

        table
          .foreign("fromUserId")
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table
          .foreign("toUserId")
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
    await knex.schema.dropTable("messages");
  } catch (error) {
    throw error;
  }
}
