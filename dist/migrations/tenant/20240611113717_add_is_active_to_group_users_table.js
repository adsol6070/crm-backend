"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("group_users", function (table) {
            table.boolean("is_active").defaultTo(true).notNullable();
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
            table.dropColumn("is_active");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
