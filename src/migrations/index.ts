import { Knex } from "knex";
import createUsersTable from "./users.table";

const migrate = async (tenant: Knex) => {
  await createUsersTable(tenant);
};

export { migrate };
