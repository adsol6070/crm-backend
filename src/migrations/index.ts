import { Knex } from "knex";
import createUsersTable from "./users.table";
import createBlogsTable from "./blog.table";
import createTokenTable from "./token.table";

const migrate = async (tenant: Knex) => {
  await createUsersTable(tenant);
  await createBlogsTable(tenant);
  await createTokenTable(tenant);
};

export { migrate };
