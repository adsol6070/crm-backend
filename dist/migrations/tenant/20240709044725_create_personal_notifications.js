"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("personal_notifications", (table) => {
            table.uuid("id").primary();
            table.uuid("user_id").notNullable();
            table.uuid("group_id").notNullable();
            table.text("message");
            table.boolean("system").defaultTo(false);
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
        await knex.schema.dropTableIfExists("personal_notifications");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
