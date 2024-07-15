"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.string('city');
        table.string('address');
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('city');
        table.dropColumn('address');
    });
}
exports.down = down;
