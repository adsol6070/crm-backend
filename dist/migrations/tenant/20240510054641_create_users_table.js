"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("users", function (table) {
            table.uuid("id").primary();
            table.uuid("tenantID").notNullable();
            table.string("firstname").notNullable();
            table.string("lastname").notNullable();
            table.string("email").notNullable().unique();
            table.string("password").notNullable();
            table.string("phone").notNullable();
            table.string("profileImage");
            table.boolean("isEmailVerified").defaultTo(false);
            table.enum("role", ["user", "admin", "superAdmin"]).defaultTo("user");
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
        await knex.schema.dropTable("users");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
