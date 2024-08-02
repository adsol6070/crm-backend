import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('visa_checklists', (table) => {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.string('visaType').notNullable();
        table.jsonb('checklist').notNullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('visa_checklists');
}