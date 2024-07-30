import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
    await knex("blogCategory").del();

    const tenant = await knex('users').select('tenantID').first();

    if (tenant) {
        const seedEntry = [
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                category: 'general',
                created_at: new Date(),
                updated_at: new Date()
            },
        ];

        // Insert the seed entry into the visaCategory table
        await knex('blogCategory').insert(seedEntry).onConflict('id').ignore();
    } else {
        console.log('No tenants found to seed.');
    }
}
