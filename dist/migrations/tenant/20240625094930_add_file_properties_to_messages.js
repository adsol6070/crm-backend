"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.table("messages", function (table) {
            table.text("file_url").nullable();
            table.string("file_type").nullable();
            table.string("file_name").nullable();
            table.string("file_size").nullable();
        });
    }
    catch (error) {
        throw error;
    }
}
exports.up = up;
async function down(knex) {
    try {
        await knex.schema.table("messages", function (table) {
            table.dropColumn("file_url");
            table.dropColumn("file_type");
            table.dropColumn("file_name");
            table.dropColumn("file_size");
        });
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
