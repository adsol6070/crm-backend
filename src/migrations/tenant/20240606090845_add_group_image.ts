import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("groups", function (table: Knex.AlterTableBuilder) {
      table.uuid("tenantID");
      table.string("image", 255);
    });
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.table("groups", function (table: Knex.AlterTableBuilder) {
      table.dropColumn("image");
      table.dropColumn("tenantID");
    });
  } catch (error) {
    throw error;
  }
}
