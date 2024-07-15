"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("group_messages", function (table) {
            table.jsonb("read_by").defaultTo([]);
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
            table.dropColumn("read_by");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
