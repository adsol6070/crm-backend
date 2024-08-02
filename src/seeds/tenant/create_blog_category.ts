import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
  await knex("blogCategory").del();

  const tenantID = process.env.TENANT_ID;

  if (tenantID) {
    const seedEntry = [
      {
        id: uuidv4(),
        tenantID,
        category: "general",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Insert the seed entry into the visaCategory table
    await knex("blogCategory").insert(seedEntry).onConflict("id").ignore();
  } else {
    console.log("No tenantID found to seed.");
  }
}
