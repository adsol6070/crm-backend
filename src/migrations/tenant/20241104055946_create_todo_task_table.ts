import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('todoTask', (table) => {
		table.uuid("id").primary();
		table.uuid("tenantID").notNullable();
		table.string("taskStatus").notNullable();
		table.string("taskTitle").notNullable();
		table.string("taskDescription").notNullable();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('todoTask');
}

