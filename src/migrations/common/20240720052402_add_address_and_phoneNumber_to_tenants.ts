import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("tenants", function (table) {
      table.string("subscriptionPlan");
      table.string("address");
      table.string("phoneNumber");
      table.date("deactivated_at");
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("tenants", function (table) {
      table.dropColumn("subscriptionPlan");
      table.dropColumn("address");
      table.dropColumn("phoneNumber");
      table.dropColumn("deactivated_at");
  });
}