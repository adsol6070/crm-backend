"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRequest = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const services_1 = require("../services");
const database_1 = require("../config/database");
const findTenant = async (tenantID, userEmail) => {
    if (tenantID) {
        const tenant = await (0, database_1.commonKnex)("tenants")
            .where({ tenantID, active: true })
            .first();
        return tenant || null;
    }
    else if (userEmail) {
        const tenant = await (0, database_1.commonKnex)("users")
            .join("tenants", "users.tenantID", "tenants.tenantID")
            .where("users.email", userEmail)
            .andWhere("tenants.active", true)
            .select("tenants.tenantID", "tenants.name", "tenants.db_connection", "tenants.active")
            .first();
        return tenant || null;
    }
    return null;
};
const connectionRequest = async (req, res, next) => {
    const tenantID = req.body.tenantID;
    const userEmail = req.body.email || req.user?.email;
    try {
        const tenant = await findTenant(tenantID, userEmail);
        if (!tenant) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `Tenant not found using ${tenantID ? "tenantID" : "email"}`);
        }
        services_1.connectionService.runWithTenantContext(tenant, () => next());
    }
    catch (error) {
        next(new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to set tenant context"));
    }
};
exports.connectionRequest = connectionRequest;
