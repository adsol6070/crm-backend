"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const database_1 = require("../config/database");
const services_1 = require("../services");
const config_1 = __importDefault(require("../config/config"));
const socketAuth = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Authentication error"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        const tenant = await (0, database_1.commonKnex)("tenants")
            .where({
            tenantID: decoded.tenantID,
            active: true,
        })
            .first();
        if (!tenant) {
            return next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Tenant not found"));
        }
        const connection = await services_1.connectionService.getTenantKnex(tenant);
        socket.data.user = await connection("users")
            .where({ id: decoded.sub })
            .first();
        if (!socket.data.user) {
            return next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User not found"));
        }
        socket.data.connection = connection;
        next();
    }
    catch (error) {
        return next(new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Authentication Error"));
    }
};
exports.socketAuth = socketAuth;
