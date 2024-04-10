"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = __importDefault(require("./config/logger"));
const config_1 = __importDefault(require("./config/config"));
const services_1 = require("./services");
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield services_1.connectionService.bootstrap();
        logger_1.default.info("Connected Successfully");
        server = app_1.app.listen(config_1.default.port, () => {
            logger_1.default.info(`Server is listening at http://localhost:${config_1.default.port}`);
        });
    }
    catch (error) {
        logger_1.default.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
});
const shutdownServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (server) {
            yield new Promise((resolve) => server.close(resolve));
            logger_1.default.info("Server closed");
        }
    }
    catch (error) {
        logger_1.default.error(`Error shutting down server: ${error}`);
    }
    finally {
        process.exit(1);
    }
});
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
