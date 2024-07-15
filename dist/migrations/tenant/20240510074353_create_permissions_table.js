"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("permissions", function (table) {
            table.uuid("id").primary();
            table.string("role").notNullable();
            table.json("permissions").notNullable();
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
        await knex.schema.dropTable("permissions");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
