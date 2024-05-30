import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", function (table: Knex.AlterTableBuilder) {
      table.boolean("online").defaultTo(false); // Online status
      table.timestamp("last_active").nullable(); // Last active timestamp
    });
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("users", function (table: Knex.AlterTableBuilder) {
      table.dropColumn("online");
      table.dropColumn("last_active"); 
    });
  } catch (error) {
    throw error;
  }
}
