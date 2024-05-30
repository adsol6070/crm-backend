import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
  await knex.schema.createTable('document_checklists',
  function (table: Knex.CreateTableBuilder) {
    table.uuid("id").primary();
    table.uuid('tenantID').notNullable();
    table.uuid('leadID').notNullable();
    table.json('documents').notNullable();
    table.string('uploadType').notNullable();
    table.timestamps(true, true);
  });
}catch(error){
  throw error;
}
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTableIfExists('document_checklists');
  } catch (error) {
    throw error;
  }
}
