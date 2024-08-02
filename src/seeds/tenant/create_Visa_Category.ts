import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
  await knex("visaCategory").del();

  const tenantID = process.env.TENANT_ID;
  console.log("TenantID:", tenantID);

  if (tenantID) {
    const seedEntry = [
      {
        id: uuidv4(),
        tenantID,
        category: "student visa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        tenantID,
        category: "tourist visa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        tenantID,
        category: "work visa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        tenantID,
        category: "business visa",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        tenantID,
        category: "immigrant visa",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Insert the seed entry into the visaCategory table
    await knex("visaCategory").insert(seedEntry).onConflict("id").ignore();
  } else {
    console.log("No tenantID found to seed.");
  }
}
