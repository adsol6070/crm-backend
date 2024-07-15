"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("group_messages", function (table) {
            table.boolean("system").defaultTo(false);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("group_messages", function (table) {
            table.dropColumn("system");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
