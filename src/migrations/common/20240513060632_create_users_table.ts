import type { Knex } from "knex";

/**
 * This function will be called when you run the migration.
 * It should define the table and its structure.
 */
export async function up(knex: Knex): Promise<void> {
  // Create the table
 return await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.uuid('tenantID').notNullable(); 
    table.string('email', 255).notNullable().unique(); 
    table.timestamps(true, true);
    table.foreign('tenantID').references('tenantID').inTable('tenants').onDelete('CASCADE');
  });
}

/**
 * This function will be called when you rollback this migration.
 * It typically undoes whatever the `up` function did.
 */
export async function down(knex: Knex): Promise<void> {
    return await knex.schema.dropTableIfExists('users');
}
