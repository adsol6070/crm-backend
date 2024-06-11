import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('lead_notes', (table) => {
    table.uuid('id').primary(); 
    table.uuid('lead_id').unsigned().notNullable().references('id').inTable('leads').onDelete('CASCADE'); 
    table.uuid('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE'); 
    table.text('note').notNullable(); 
    table.timestamp('created_at').defaultTo(knex.fn.now()); 
    table.timestamp('updated_at').defaultTo(knex.fn.now()); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lead_notes');
}
