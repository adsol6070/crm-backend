import { Knex } from "knex";
import createUsersTable from "./users.table";
import createBlogsTable from "./blog.table";
import createTokenTable from "./token.table";
import createPermissionsTables from "./permissions.table";

const migrate = async (tenant: Knex) => {
  await createUsersTable(tenant);
  await createBlogsTable(tenant);
  await createTokenTable(tenant);
  await createPermissionsTables(tenant);
};

export { migrate };
