"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const error_1 = require("./middlewares/error");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((_err, _req, _res, next) => {
    next(new ApiError_1.default(http_status_1.default.NOT_FOUND, "Not found"));
});
app.use(error_1.errorConverter);
app.use(error_1.errorHandler);
