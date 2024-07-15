"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("users", function (table) {
            table.boolean("online").defaultTo(false); // Online status
            table.timestamp("last_active").nullable(); // Last active timestamp
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("users", function (table) {
            table.dropColumn("online");
            table.dropColumn("last_active");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
