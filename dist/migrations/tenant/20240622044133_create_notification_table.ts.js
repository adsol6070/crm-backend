"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable('lead_notifications', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable();
        table.uuid('lead_id').unsigned().notNullable().references('id').inTable('leads').onDelete('CASCADE');
        table.text('message').notNullable();
        table.text('icon');
        table.text('variant');
        table.boolean('read').defaultTo(false);
        table.timestamps(true, true);
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('lead_notifications');
}
exports.down = down;
