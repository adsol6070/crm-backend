import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('leads', table => {
        table.string('district');
        table.string('state');
        table.string('city');
        table.string('country');
        table.string('pincode', 6);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('leads', table => {
        table.dropColumn('district');
        table.dropColumn('state');
        table.dropColumn('city');
        table.dropColumn('country');
        table.dropColumn('pincode');
    });
}

