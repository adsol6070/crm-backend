import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("taskComments", (table) => {
    table.uuid("id").primary(); 
    table.uuid("tenantID").notNullable();
    table
      .uuid("task_id")
      .nullable()
      .references("id")
      .inTable("todoTask")
      .onDelete("CASCADE"); 
    table.text("content").notNullable(); 
    table.uuid("author_id").notNullable(); 
    table.boolean("is_edited").defaultTo(false); 
    table.timestamps(true, true); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("taskComments");
}