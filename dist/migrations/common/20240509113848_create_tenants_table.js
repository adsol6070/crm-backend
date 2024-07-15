"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable("tenants", function (table) {
        table.uuid("tenantID").primary();
        table.string("name").notNullable();
        table.json("db_connection").notNullable();
        table.boolean("active").defaultTo(true);
        table.timestamps(true, true);
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable("tenants");
}
exports.down = down;
