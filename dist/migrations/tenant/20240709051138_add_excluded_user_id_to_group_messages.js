"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("group_messages", function (table) {
            table
                .uuid("excluded_user_id")
                .nullable()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
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
            table.dropColumn("excluded_user_id");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
