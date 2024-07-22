import { app } from "./app";
import logger from "./config/logger";
import config from "./config/config";
import { createServer } from "http";
import { setupChatSocket } from "./sockets/chatSocket";
import { createCommonDatabase } from "./scripts/createCommonDatabase";

// Define server and custom socket interface
let server: any;
let io: any;

const startServer = async () => {
  try {
    await createCommonDatabase();
    logger.info("Connected Successfully");

    const httpServer = createServer(app);

    io = setupChatSocket(httpServer);

    server = httpServer.listen(config.port, () => {
      logger.info(`Server is listening at http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

const shutdownServer = async () => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info("Server closed");
    }
  } catch (error) {
    logger.error(`Error shutting down server: ${error}`);
  } finally {
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  shutdownServer();
});

process.on("unhandledRejection", (error) => {
  logger.error(`Unhandled Rejection: ${error}`);
  shutdownServer();
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  shutdownServer();
});

process.on("SIGINT", () => {
  logger.info("SIGINT received");
  shutdownServer();
});

startServer();

export { io };
