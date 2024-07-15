"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("group_messages", function (table) {
            table.uuid("id").primary();
            table
                .uuid("group_id")
                .references("id")
                .inTable("groups")
                .onDelete("CASCADE");
            table
                .uuid("from_user_id")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.text("message").notNullable();
            table.timestamp("timestamp").defaultTo(knex.fn.now());
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.dropTable("group_messages");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
