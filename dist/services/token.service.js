"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokens_1 = require("../config/tokens");
const config_1 = __importDefault(require("../config/config"));
const user_service_1 = __importDefault(require("./user.service"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const generateToken = async (userId, tenantID, role, expires, type, secret) => {
    const payload = {
        sub: userId,
        tenantID,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expires,
        type,
    };
    return jsonwebtoken_1.default.sign(payload, secret);
};
const saveToken = async (connection, token, userId, tenantID, expires, type, blacklisted = false) => {
    const tokenDoc = await connection("tokens")
        .insert({
        id: (0, uuid_1.v4)(),
        tenantID,
        user: userId,
        token,
        expires,
        type,
        blacklisted,
    })
        .returning("*");
    return tokenDoc;
};
const verifyToken = async (connection, token, type) => {
    const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
    const tokenDoc = await connection("tokens")
        .select("*")
        .where({ token, type, user: payload.sub, blacklisted: false })
        .first();
    if (!tokenDoc) {
        throw new Error("Token not found");
    }
    return tokenDoc;
};
const generateAuthTokens = async (user, connection) => {
    const accessToken = await generateToken(user.id, user.tenantID, user.role, config_1.default.jwt.accessExpirationTime, tokens_1.tokenTypes.ACCESS, config_1.default.jwt.secret);
    const refreshToken = await generateToken(user.id, user.tenantID, user.role, config_1.default.jwt.refreshExpirationTime, tokens_1.tokenTypes.REFRESH, config_1.default.jwt.secret);
    await saveToken(connection, refreshToken, user.id, user.tenantID, config_1.default.jwt.refreshExpirationTime, tokens_1.tokenTypes.REFRESH);
    return {
        accessToken,
        refreshToken,
    };
};
const generateResetPasswordToken = async (connection, email) => {
    const user = await user_service_1.default.getUserByEmail(connection, email);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No users found with this email");
    }
    const resetPasswordToken = await generateToken(user.id, user.tenantID, user.role, config_1.default.jwt.resetPasswordExpirationMinutes, tokens_1.tokenTypes.RESET_PASSWORD, config_1.default.jwt.secret);
    await saveToken(connection, resetPasswordToken, user.id, user.tenantID, config_1.default.jwt.resetPasswordExpirationMinutes, tokens_1.tokenTypes.RESET_PASSWORD);
    return resetPasswordToken;
};
exports.default = {
    generateToken,
    generateAuthTokens,
    verifyToken,
    generateResetPasswordToken,
};
