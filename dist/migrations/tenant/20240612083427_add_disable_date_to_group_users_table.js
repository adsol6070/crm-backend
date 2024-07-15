"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("group_users", function (table) {
            table.timestamp("disable_date").nullable();
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("group_users", function (table) {
            table.dropColumn("disable_date");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
