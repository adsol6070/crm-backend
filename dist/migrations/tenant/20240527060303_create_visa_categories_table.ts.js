"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("visaCategory", function (table) {
            table.uuid("id").primary();
            table.uuid("tenantID").notNullable();
            table.string("category").notNullable();
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
        await knex.schema.dropTable("visaCategory");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
