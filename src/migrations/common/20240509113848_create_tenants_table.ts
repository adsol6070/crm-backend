import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tenants", function (table) {
    table.uuid("tenantID").primary();
    table.string("name").notNullable();
    table.json("db_connection").notNullable();
    table.boolean("active").defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("tenants");
}
