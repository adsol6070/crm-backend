import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable("personal_notifications", (table) => {
      table.uuid("id").primary();
      table.uuid("user_id").notNullable();
      table.uuid("group_id").notNullable();
      table.text("message");
      table.boolean("system").defaultTo(false);
      table.timestamps(true, true);
    });
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists("personal_notifications");
  } catch (error) {
    throw error;
  }
}
