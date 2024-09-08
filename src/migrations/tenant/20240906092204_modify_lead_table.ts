import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("leads", (table: Knex.AlterTableBuilder) => {
    table.timestamp("dob").alter();
    table.timestamp("passportExpiry").alter();
    table.timestamp("followUpDates").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("leads", (table: Knex.AlterTableBuilder) => {
    table.date("dob").alter();
    table.date("passportExpiry").alter();
    table.date("followUpDates").alter();
  });
}