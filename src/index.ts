import mongoose from "mongoose";
import { app } from "./app";
import logger from "./config/logger";
import config from "./config/config";

let server: any;

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    logger.info("Connected to MongoDB");

    server = app.listen(config.port, () => {
      logger.info(`Server is listening at http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

startServer();
