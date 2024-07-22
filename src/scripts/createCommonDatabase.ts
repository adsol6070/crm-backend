import knex from "knex";
import { commonKnex, config } from "../config/database";
import logger from "../config/logger";

export const createCommonDatabase = async () => {
  const initialKnex = knex({
    client: "pg",
    connection: {
      ...config.common.connection,
      password: config.common.connection.password,
      database: "postgres",
    },
  });

  try {
    const dbExists = await initialKnex.raw(
      `SELECT 1 FROM pg_database WHERE datname = ?;`,
      [config.common.connection.database],
    );

    if (!dbExists.rows.length) {
      await initialKnex.raw(`CREATE DATABASE ??`, [
        config.common.connection.database,
      ]);
      logger.info(
        `Database ${config.common.connection.database} created successfully.`,
      );
    } else {
      logger.info(
        `Database ${config.common.connection.database} already exists.`,
      );
    }
  } catch (error) {
    logger.error(`Error creating common database: ${error}`);
  } finally {
    await initialKnex.destroy();
  }
};
