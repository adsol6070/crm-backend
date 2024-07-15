"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const services_1 = require("../services");
const register = (0, catchAsync_1.default)(async (req, res) => {
    const uploadedFile = req.file;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const user = await services_1.userService.createUser(connection, req.body, uploadedFile);
    res.status(http_status_1.default.CREATED).json({ user });
});
const login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const user = await services_1.authService.loginWithEmailAndPassword(connection, email, password);
    const tokens = await services_1.tokenService.generateAuthTokens(user, connection);
    res.status(http_status_1.default.OK).json({ user, tokens });
});
const logout = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    await services_1.authService.logout(connection, req.body.refreshToken);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const refreshTokens = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const tokens = await services_1.authService.refreshAuth(connection, req.body.refresh_token);
    res.send({ ...tokens });
});
const forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const resetPasswordToken = await services_1.tokenService.generateResetPasswordToken(connection, req.body.email);
    await services_1.emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    await services_1.authService.resetPassword(connection, req.body.token, req.body.password);
    res.status(http_status_1.default.NO_CONTENT).send();
});
exports.default = {
    register,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
};
