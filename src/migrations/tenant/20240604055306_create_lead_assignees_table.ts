import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "lead_assignees",
      (table: Knex.CreateTableBuilder) => {
        table
          .uuid("lead_id")
          .references("id")
          .inTable("leads")
          .onDelete("CASCADE")
          .notNullable();
        table.specificType("user_id", "uuid[]").notNullable();
        table.primary(["lead_id"]);
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("lead_assignees");
  } catch (error) {
    throw error;
  }
}
