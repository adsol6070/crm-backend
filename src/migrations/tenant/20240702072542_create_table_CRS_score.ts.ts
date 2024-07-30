import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('CRSscores', (table) => {
    table.uuid('id').primary();
    table.uuid('tenantID');
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('phone').notNullable();
    table.string('age');
    table.string('education');
    table.string('foreign_experience');
    table.string('canadian_experience');
    table.string('first_language');
    table.string('second_language');
    table.string('spouse');
    table.string('sibling_in_canada');
    table.string('job_offer');
    table.string('provincial_nomination');
    table.string('canadian_degree');
    table.string('spouse_education');
    table.string('spouse_language');
    table.string('spouse_experience');
    table.string('score').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('CRSscores');
}
