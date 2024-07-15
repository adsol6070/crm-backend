"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema.alterTable("leads", (table) => {
        table.uuid("userID");
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema.alterTable("leads", (table) => {
        table.dropColumn("userID");
    });
}
exports.down = down;
