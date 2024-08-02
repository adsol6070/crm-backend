import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("lead_notifications", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").notNullable();
    table
      .uuid("lead_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("leads")
      .onDelete("CASCADE");
    table.text("message").notNullable();
    table.text("icon");
    table.text("variant");
    table.boolean("read").defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("lead_notifications");
}
