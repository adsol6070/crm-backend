import { Knex } from "knex";
import createUsersTable from "./users.table";
import createBlogsTable from "./blog.table";

const migrate = async (tenant: Knex) => {
  await createUsersTable(tenant);
  await createBlogsTable(tenant);
};

export { migrate };
