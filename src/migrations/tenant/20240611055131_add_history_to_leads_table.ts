import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.alterTable("leads", function (table: Knex.AlterTableBuilder) {
      table.jsonb("leadHistory");
    });
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.alterTable("leads", function (table: Knex.AlterTableBuilder) {
      table.dropColumn("leadHistory");
    });
  } catch (error) {
    throw error;
  }
}
