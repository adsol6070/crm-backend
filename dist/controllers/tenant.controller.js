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
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const uuid_1 = require("uuid");
const generate_password_1 = __importDefault(require("generate-password"));
const slugify_1 = __importDefault(require("slugify"));
const databse_1 = require("../config/databse");
const services_1 = require("../services");
const createTenant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organization } = req.body;
    const tenantName = (0, slugify_1.default)(organization.toLowerCase(), "_");
    const password = generate_password_1.default.generate({ length: 12, numbers: true });
    const uuid = (0, uuid_1.v4)();
    const tenant = {
        uuid,
        db_name: tenantName,
        db_username: tenantName,
        db_password: password,
    };
    yield (0, databse_1.db)("tenants").insert(tenant);
    yield services_1.tenantService.up({ tenantName, password, uuid });
    res.status(http_status_1.default.OK).send({ tenant: Object.assign({}, tenant) });
}));
exports.default = { createTenant };
