"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
/**
 * This function will be called when you run the migration.
 * It should define the table and its structure.
 */
async function up(knex) {
    // Create the table
    return await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary();
        table.uuid('tenantID').notNullable();
        table.string('email', 255).notNullable().unique();
        table.timestamps(true, true);
        table.foreign('tenantID').references('tenantID').inTable('tenants').onDelete('CASCADE');
    });
}
exports.up = up;
/**
 * This function will be called when you rollback this migration.
 * It typically undoes whatever the `up` function did.
 */
async function down(knex) {
    return await knex.schema.dropTableIfExists('users');
}
exports.down = down;
