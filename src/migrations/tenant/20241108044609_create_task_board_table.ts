import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('todoBoard', (table) => {
		table.uuid("id").primary();
		table.uuid("tenantID").notNullable();	table.uuid('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.string("boardTitle").notNullable();
		table.text("boardDescription").notNullable();
		table.timestamps(true, true);
	});
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('todoBoard');
}

