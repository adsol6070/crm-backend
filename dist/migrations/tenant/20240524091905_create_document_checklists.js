"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    try {
        await knex.schema.createTable('document_checklists', function (table) {
            table.uuid("id").primary();
            table.uuid('tenantID').notNullable();
            table.uuid('leadID').notNullable();
            table.json('documents').notNullable();
            table.string('uploadType').notNullable();
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
        await knex.schema.dropTableIfExists('document_checklists');
    }
    catch (error) {
        throw error;
    }
}
exports.down = down;
