"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("tokens", function (table) {
            table.uuid("id").primary();
            table.uuid("tenantID").notNullable();
            table.uuid("user");
            table.foreign("user").references("users.id");
            table.text("token").notNullable();
            table.string("expires").notNullable();
            table.string("type").notNullable();
            table.boolean("blacklisted").defaultTo(false);
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
        await knex.schema.dropTable("tokens");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
