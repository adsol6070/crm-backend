"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("messages", function (table) {
            table.boolean("read").defaultTo(false);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("messages", function (table) {
            table.dropColumn("read");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
