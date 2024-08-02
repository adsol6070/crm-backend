// migration file: [timestamp]_create_seed_tracking_table.ts

import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('seed_tracking', (table) => {
    table.increments('id').primary();
    table.string('tenant_id').notNullable();
    table.string('script_name').notNullable();
    table.timestamp('executed_at').defaultTo(knex.fn.now());
    table.unique(['tenant_id', 'script_name']);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('seed_tracking');
};
