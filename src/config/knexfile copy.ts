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
      host: "127.0.0.1",
      user: "postgres",
      password: "admin",
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

module.exports = config;
