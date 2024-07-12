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
      host: "dpg-cq8c79uehbks738h2t5g-a",
      user: "adsol",
      password: "H0HewIrfGCDQ3A4kK8Zb8ehRLxwJ9vlP",
      database: "demo_94e3",
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
