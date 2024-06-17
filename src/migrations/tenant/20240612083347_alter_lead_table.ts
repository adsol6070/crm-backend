import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("leads", (table: Knex.AlterTableBuilder) => {
    table.uuid("userID");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("leads", (table: Knex.AlterTableBuilder) => {
    table.dropColumn("userID");
  });
}