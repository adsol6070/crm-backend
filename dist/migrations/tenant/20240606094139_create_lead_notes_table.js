"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema.createTable('lead_notes', (table) => {
        table.uuid('id').primary();
        table.uuid('lead_id').unsigned().notNullable().references('id').inTable('leads').onDelete('CASCADE');
        table.uuid('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.text('note').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema.dropTableIfExists('lead_notes');
}
exports.down = down;
