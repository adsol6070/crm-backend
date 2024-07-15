"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const common_service_1 = __importDefault(require("./common.service"));
const token_service_1 = __importDefault(require("./token.service"));
const tokens_1 = require("../config/tokens");
const user_service_1 = __importDefault(require("./user.service"));
const loginWithEmailAndPassword = async (connection, email, password) => {
    const user = await connection("users").where({ email }).first();
    if (!user ||
        !(await common_service_1.default.isPasswordMatch(password, user.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Incorrect email or password");
    }
    return user;
};
const logout = async (connection, refreshToken) => {
    const refreshTokenDoc = await connection("tokens")
        .select("*")
        .where({
        token: refreshToken,
        type: tokens_1.tokenTypes.REFRESH,
        blacklisted: false,
    })
        .first();
    if (!refreshTokenDoc) {
        return;
    }
    const reponse = await connection("tokens")
        .where({ id: refreshTokenDoc.id })
        .del();
};
const refreshAuth = async (connection, refreshToken) => {
    try {
        const refreshTokenDoc = await token_service_1.default.verifyToken(connection, refreshToken, tokens_1.tokenTypes.REFRESH);
        const user = await user_service_1.default.getUserByID(connection, refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await connection("tokens")
            .where({ token: refreshToken, type: tokens_1.tokenTypes.REFRESH })
            .del();
        return token_service_1.default.generateAuthTokens(user, connection);
    }
    catch (error) {
        console.log("ERROR:", error);
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "2 Please authenticate");
    }
};
const resetPassword = async (connection, resetPasswordToken, newPassword) => {
    try {
        const resetPasswordTokenDoc = await token_service_1.default.verifyToken(connection, resetPasswordToken, tokens_1.tokenTypes.RESET_PASSWORD);
        const user = await user_service_1.default.getUserByID(connection, resetPasswordTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await user_service_1.default.updateUserById(connection, user.id, {
            password: newPassword,
        });
        await connection("tokens")
            .where({ user: user.id, type: tokens_1.tokenTypes.RESET_PASSWORD })
            .del();
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Password reset failed");
    }
};
exports.default = {
    loginWithEmailAndPassword,
    logout,
    refreshAuth,
    resetPassword,
};
