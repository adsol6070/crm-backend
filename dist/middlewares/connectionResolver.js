"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRequest = void 0;
const continuation_local_storage_1 = require("continuation-local-storage");
const services_1 = require("../services");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const namespace = (0, continuation_local_storage_1.createNamespace)("tenants");
const connectionRequest = (req, res, next) => {
    const tenantId = req.body.tenantID;
    // Check if tenantID is present
    if (!tenantId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Tenant ID is required");
    }
    namespace.run(() => {
        namespace.set("connection", services_1.connectionService.getTenantConnection(tenantId));
        next();
    });
};
exports.connectionRequest = connectionRequest;
