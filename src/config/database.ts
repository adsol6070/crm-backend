import { knex, type Knex } from "knex";

interface DatabaseConfig {
  client: string;
  connection: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    directory: string;
  };
}

const config: Record<"common" | "tenant", DatabaseConfig> = {
  common: {
    client: "pg",
    connection: {
      host: "dpg-cq92rs2ju9rs73av4h7g-a",
      user: "tenants_user",
      password: "Et5qOSWSEjVyAbd6p1xvyI0CXQlkNCcK",
      database: "tenants",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "../migrations/common",
    },
  },

  tenant: {
    client: "pg",
    connection: {
      host: "your-tenant-db-host",
      user: "your-user",
      password: "your-password",
      database: "template-tenant-db",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "../migrations/tenant",
    },
  },
};

const commonKnex = knex(config.common);

export { config, commonKnex };
