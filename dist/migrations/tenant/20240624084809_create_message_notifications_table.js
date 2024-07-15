"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("message_notifications", (table) => {
            table.uuid("id").primary();
            table.uuid("user_id").notNullable();
            table.string("name").notNullable();
            table.string("subText").notNullable();
            table.string("avatar").notNullable();
            table.timestamp("createdAt").defaultTo(knex.fn.now());
            table.boolean("read").defaultTo(false);
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
        await knex.schema.dropTable("message_notifications");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
