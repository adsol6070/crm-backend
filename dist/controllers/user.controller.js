"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const services_1 = require("../services");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const getUserProfile = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const userId = req.body.userId;
    const userProfile = await services_1.userService.getUserProfile(connection, userId);
    res.status(http_status_1.default.OK).json(userProfile);
});
const createUser = (0, catchAsync_1.default)(async (req, res) => {
    const uploadedFile = req.file;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const user = await services_1.userService.createUser(connection, req.body, uploadedFile);
    const message = "User created successfully.";
    res.status(http_status_1.default.CREATED).json({ message, user });
});
const getUser = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const user = await services_1.userService.getUserByID(connection, req.params.userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    res.send(user);
});
const getUserImage = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const userId = req.params.userId;
    const imagePath = await services_1.userService.getUserImageById(connection, userId);
    res.status(http_status_1.default.OK).sendFile(imagePath);
});
const getUsers = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const users = await services_1.userService.getAllUsers(connection);
    if (!users) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Users not found");
    }
    res.status(http_status_1.default.OK).json({ users });
});
const updateUser = (0, catchAsync_1.default)(async (req, res) => {
    const uploadedFile = req.file;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    await services_1.userService.updateUserById(connection, req.params.userId, req.body, uploadedFile);
    const message = "User updated successfully.";
    res.status(http_status_1.default.OK).json({ message });
});
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const user = await services_1.userService.deleteUserById(connection, req.params.userId);
    res.status(http_status_1.default.NO_CONTENT).send();
});
exports.default = {
    getUserProfile,
    createUser,
    getUser,
    getUsers,
    updateUser,
    deleteUser,
    getUserImage,
};
