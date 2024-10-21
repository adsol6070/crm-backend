import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "users",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.string("firstname").notNullable();
        table.string("lastname").notNullable();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.string("phone").notNullable();
        table.string("city");
        table.string("address");
        table.boolean("online").defaultTo(false);
        table.timestamp("last_active").nullable();
        table.string("profileImage");
        table.boolean("isEmailVerified").defaultTo(false);
        table.string("role").defaultTo("user");
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("users");
  } catch (error) {
    throw error;
  }
}
