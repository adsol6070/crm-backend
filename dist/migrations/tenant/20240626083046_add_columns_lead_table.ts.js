"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.alterTable('leads', table => {
        table.string('district');
        table.string('state');
        table.string('city');
        table.string('country');
        table.string('pincode', 6);
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.alterTable('leads', table => {
        table.dropColumn('district');
        table.dropColumn('state');
        table.dropColumn('city');
        table.dropColumn('country');
        table.dropColumn('pincode');
    });
}
exports.down = down;
