"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("groups", function (table) {
            table.uuid("tenantID");
            table.string("image", 255);
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("groups", function (table) {
            table.dropColumn("image");
            table.dropColumn("tenantID");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
