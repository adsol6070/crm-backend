"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const passport_1 = __importDefault(require("passport"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const services_1 = require("../services");
const database_1 = require("../config/database");
const verifyCallback = (req, resolve, reject, requiredRights, category = null) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "1 Please authenticate"));
    }
    req.user = user;
    if (!category || requiredRights.length === 0) {
        return resolve();
    }
    if (user.role === "superAdmin") {
        return resolve();
    }
    try {
        const tenant = await (0, database_1.commonKnex)("tenants")
            .where({
            tenantID: user.tenantID,
            active: true,
        })
            .first();
        const connection = await services_1.connectionService.getTenantKnex(tenant);
        const permissions = await services_1.permissionsService.getPermissionByRole(connection, user.role);
        if (!permissions) {
            return reject(new ApiError_1.default(http_status_1.default.FORBIDDEN, "Role permissions not found"));
        }
        const userRights = permissions.permissions;
        const categoryRights = userRights[category] || {};
        const hasRequiredRights = requiredRights.every((requiredRight) => {
            return categoryRights[requiredRight] === true;
        });
        if (!hasRequiredRights) {
            return reject(new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden"));
        }
        resolve();
    }
    catch (error) {
        return reject(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to verify permissions"));
    }
};
const auth = (category = null, ...requiredRights) => async (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport_1.default.authenticate("jwt", { session: false }, verifyCallback(req, resolve, reject, requiredRights, category))(req, res, next);
    })
        .then(() => next())
        .catch((error) => next(error));
};
exports.auth = auth;
