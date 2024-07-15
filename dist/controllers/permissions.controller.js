"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const services_1 = require("../services");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const createPermission = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const permission = await services_1.permissionsService.createPermission(connection, req.body);
    res.status(http_status_1.default.CREATED).json(permission);
});
const getPermission = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const permission = await services_1.permissionsService.getPermissionById(connection, req.params.id);
    if (!permission) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Permission not found");
    }
    res.status(http_status_1.default.OK).json(permission);
});
const getPermissionByRole = (0, catchAsync_1.default)(async (req, res, next) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const permission = await services_1.permissionsService.getPermissionByRole(connection, req.body.role);
    if (!permission) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Permission not found");
    }
    res.status(http_status_1.default.OK).json(permission);
});
const getAllPermissions = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const permissions = await services_1.permissionsService.getAllPermissions(connection);
    res.status(http_status_1.default.OK).json(permissions);
});
const updatePermission = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const updatedPermission = await services_1.permissionsService.updatePermissionById(connection, req.params.permissionId, req.body);
    res.status(http_status_1.default.OK).json(updatedPermission);
});
const deletePermission = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    await services_1.permissionsService.deletePermissionById(connection, req.params.permissionId);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const getRoles = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const roles = await services_1.permissionsService.getRoles(connection);
    if (!roles || roles.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No roles found");
    }
    res.status(http_status_1.default.OK).json(roles);
});
exports.default = {
    createPermission,
    getPermission,
    getPermissionByRole,
    getAllPermissions,
    updatePermission,
    deletePermission,
    getRoles,
};
