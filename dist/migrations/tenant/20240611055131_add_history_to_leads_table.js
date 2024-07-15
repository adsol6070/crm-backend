"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.alterTable("leads", function (table) {
            table.jsonb("leadHistory");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.alterTable("leads", function (table) {
            table.dropColumn("leadHistory");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
