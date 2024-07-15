import { knex, type Knex } from "knex";
import envConfig from "./config";
import path from "path";

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

const isProduction = process.env.NODE_ENV === "production";

const config: Record<"common" | "tenant", DatabaseConfig> = {
  common: {
    client: envConfig.postgres.client,
    connection: {
      host: envConfig.postgres.connection.host,
      user: envConfig.postgres.connection.user,
      password: envConfig.postgres.connection.password,
      database: envConfig.postgres.connection.database,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(
        __dirname,
        isProduction ? "../../dist/migrations/common" : "../migrations/common",
      ),
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
