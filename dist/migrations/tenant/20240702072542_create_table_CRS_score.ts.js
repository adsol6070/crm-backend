"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema.createTable('CRSscores', (table) => {
        table.uuid('id').primary();
        table.uuid('tenantID');
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('phone').notNullable();
        table.string('score').notNullable();
        table.timestamps(true, true);
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema.dropTableIfExists('CRSscores');
}
exports.down = down;
