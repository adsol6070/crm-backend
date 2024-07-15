"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = require("./app");
const logger_1 = __importDefault(require("./config/logger"));
const config_1 = __importDefault(require("./config/config"));
const services_1 = require("./services");
const http_1 = require("http");
const chatSocket_1 = require("./sockets/chatSocket");
// Define server and custom socket interface
let server;
let io;
const startServer = async () => {
    try {
        await services_1.connectionService.createCommonDatabase();
        logger_1.default.info("Connected Successfully");
        const httpServer = (0, http_1.createServer)(app_1.app);
        exports.io = io = (0, chatSocket_1.setupChatSocket)(httpServer);
        server = httpServer.listen(config_1.default.port, () => {
            logger_1.default.info(`Server is listening at http://localhost:${config_1.default.port}`);
        });
    }
    catch (error) {
        logger_1.default.error(`Error starting server: ${error}`);
        process.exit(1);
    }
};
const shutdownServer = async () => {
    try {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            logger_1.default.info("Server closed");
        }
    }
    catch (error) {
        logger_1.default.error(`Error shutting down server: ${error}`);
    }
    finally {
        process.exit(1);
    }
};
process.on("uncaughtException", (error) => {
    logger_1.default.error(`Uncaught Exception: ${error}`);
    shutdownServer();
});
process.on("unhandledRejection", (error) => {
    logger_1.default.error(`Unhandled Rejection: ${error}`);
    shutdownServer();
});
process.on("SIGTERM", () => {
    logger_1.default.info("SIGTERM received");
    shutdownServer();
});
process.on("SIGINT", () => {
    logger_1.default.info("SIGINT received");
    shutdownServer();
});
startServer();
