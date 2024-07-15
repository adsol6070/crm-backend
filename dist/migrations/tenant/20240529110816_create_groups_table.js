"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("groups", function (table) {
            table.uuid("id").primary();
            table.string("name", 255).notNullable();
            table
                .uuid("creator_id")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.timestamp("created_at").defaultTo(knex.fn.now());
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.dropTable("groups");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
