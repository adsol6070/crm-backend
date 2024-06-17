import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("user_messages", (table) => {
      table.uuid("user_id").notNullable();
      table.uuid("message_id").notNullable();
      table.primary(["user_id", "message_id"]);
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .foreign("message_id")
        .references("id")
        .inTable("messages")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    });
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("user_messages");
  } catch (error) {
    throw error;
  }
}
