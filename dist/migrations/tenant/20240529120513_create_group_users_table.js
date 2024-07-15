"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("group_users", function (table) {
            table
                .uuid("group_id")
                .references("id")
                .inTable("groups")
                .onDelete("CASCADE");
            table
                .uuid("user_id")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.primary(["group_id", "user_id"]);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.dropTable("group_users");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
