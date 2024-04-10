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
const config_1 = __importDefault(require("./config/config"));
const morgan_1 = __importDefault(require("./config/morgan"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
exports.app = app;
const BASE_URL = `/api/${process.env.VERSION || "v1"}`;
if (config_1.default.env !== "test") {
    app.use(morgan_1.default.successHandler);
    app.use(morgan_1.default.errorHandler);
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
if (config_1.default.env === "production") {
    app.use(`${BASE_URL}/auth`, rateLimiter_1.authLimiter);
}
app.use(BASE_URL, routes_1.router);
app.use((_req, _res, next) => {
    next(new ApiError_1.default(http_status_1.default.NOT_FOUND, "Not found"));
});
app.use(error_1.errorConverter);
app.use(error_1.errorHandler);
