import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "message_notifications",
      (table: Knex.CreateTableBuilder) => {
        table.uuid("id").primary();
        table.uuid("user_id").notNullable();
        table.string("name").notNullable();
        table.string("subText").notNullable();
        table.string("avatar").notNullable();
        table.timestamp("createdAt").defaultTo(knex.fn.now());
        table.boolean("read").defaultTo(false);
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("message_notifications");
  } catch (error) {
    throw error;
  }
}
