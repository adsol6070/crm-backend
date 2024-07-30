import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
    await knex("visa_checklists").del();
    const tenant = await knex('users').select('tenantID').first();

    if (tenant) {
        const seedEntry = [
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                visaType: 'student visa',
                checklist: JSON.stringify([
                    { "name": "Passport", "required": true },
                    { "name": "Photo", "required": true },
                    { "name": "Letter of Acceptance from Educational Institution", "required": true },
                    { "name": "Proof of Financial Support", "required": true },
                    { "name": "Medical Examination Report", "required": false },
                    { "name": "English Language Proficiency Test Scores", "required": true },
                    { "name": "Police Clearance Certificate", "required": false }
                ]),
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                visaType: 'tourist visa',
                checklist: JSON.stringify([
                    { "name": "Passport", "required": true },
                    { "name": "Photo", "required": true },
                    { "name": "Travel Itinerary", "required": true },
                    { "name": "Proof of Financial Means", "required": true },
                    { "name": "Hotel Booking", "required": true },
                    { "name": "Travel Insurance", "required": false }
                ]),
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                visaType: 'work visa',
                checklist: JSON.stringify([
                    { "name": "Passport", "required": true },
                    { "name": "Photo", "required": true },
                    { "name": "Job Offer Letter", "required": true },
                    { "name": "Proof of Qualifications", "required": true },
                    { "name": "Proof of Work Experience", "required": true },
                    { "name": "Medical Examination Report", "required": true },
                    { "name": "Police Clearance Certificate", "required": true }
                ]),
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                visaType: 'business visa',
                checklist: JSON.stringify([
                    { "name": "Passport", "required": true },
                    { "name": "Photo", "required": true },
                    { "name": "Business Invitation Letter", "required": true },
                    { "name": "Proof of Business Ownership", "required": true },
                    { "name": "Proof of Financial Means", "required": true },
                    { "name": "Travel Itinerary", "required": true },
                    { "name": "Proof of Accommodation", "required": false }
                ]),
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                tenantID: tenant.tenantID,
                visaType: 'immigrant visa',
                checklist: JSON.stringify([
                    { "name": "Passport", "required": true },
                    { "name": "Photo", "required": true },
                    { "name": "Medical Examination Report", "required": true },
                    { "name": "Police Clearance Certificate", "required": true },
                    { "name": "Proof of Relationship (if applicable)", "required": true },
                    { "name": "Proof of Financial Support", "required": true },
                    { "name": "Biometric Information", "required": true }
                ]),
                created_at: new Date(),
                updated_at: new Date()
            },
        ];

        // Insert the seed entry into the visaCategory table
        await knex('visa_checklists').insert(seedEntry).onConflict('id').ignore();
    } else {
        console.log('No tenants found to seed.');
    }
}
