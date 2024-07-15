"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("messages", function (table) {
            table.uuid("id").primary();
            table.uuid("fromUserId").notNullable();
            table.uuid("toUserId").notNullable();
            table.text("message").notNullable();
            table.timestamp("timestamp").defaultTo(knex.fn.now());
            table
                .foreign("fromUserId")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table
                .foreign("toUserId")
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
        await knex.schema.dropTable("messages");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
