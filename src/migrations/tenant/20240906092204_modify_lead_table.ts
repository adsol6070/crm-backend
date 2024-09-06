import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("leads", (table: Knex.AlterTableBuilder) => {
    table.timestamp("dob");
    table.timestamp("passportExpiry");
    table.timestamp("followUpDates");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("leads", (table: Knex.AlterTableBuilder) => {
    table.dropColumn("dob");
    table.dropColumn("passportExpiry");
    table.dropColumn("followUpDates");
  });
}