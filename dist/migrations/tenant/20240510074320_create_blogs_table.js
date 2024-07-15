"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("blogs", function (table) {
            table.uuid("id").primary();
            table.uuid("tenantID").notNullable();
            table.text("title").notNullable();
            table.text("content").notNullable();
            table.text("description").notNullable();
            table.text("category").notNullable();
            table.string("blogImage");
            table.timestamps(true, true);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.dropTable("blogs");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
