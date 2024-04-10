"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const continuation_local_storage_1 = require("continuation-local-storage");
const databse_1 = require("../config/databse");
const tenant_model_1 = __importDefault(require("../models/tenant.model"));
let tenantMapping = [];
const getConfig = (tenant) => {
    const { db_username: user, db_name: database, db_password: password, } = tenant;
    return Object.assign(Object.assign({}, databse_1.dbConfiguration), { connection: Object.assign(Object.assign({}, databse_1.dbConfiguration.connection), { user,
            database,
            password }) });
};
const getConnection = () => { var _a; return ((_a = (0, continuation_local_storage_1.getNamespace)("tenants")) === null || _a === void 0 ? void 0 : _a.get("connection")) || null; };
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, tenant_model_1.default)();
        const tenants = yield databse_1.db
            .select("uuid", "db_name", "db_username", "db_password")
            .from("tenants");
        tenantMapping = tenants.map((tenant) => ({
            uuid: tenant.uuid,
            connection: (0, knex_1.default)(getConfig(tenant)),
        }));
    }
    catch (error) {
        console.error(error);
    }
});
const getTenantConnection = (uuid) => {
    const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid);
    if (!tenant)
        return null;
    return tenant.connection;
};
exports.default = { bootstrap, getTenantConnection, getConnection };
