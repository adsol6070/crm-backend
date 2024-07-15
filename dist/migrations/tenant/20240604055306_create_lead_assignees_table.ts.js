"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable("lead_assignees", (table) => {
            table
                .uuid("lead_id")
                .references("id")
                .inTable("leads")
                .onDelete("CASCADE")
                .notNullable();
            table.specificType("user_id", "uuid[]").notNullable();
            table.primary(["lead_id"]);
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
        await knex.schema.dropTable("lead_assignees");
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
