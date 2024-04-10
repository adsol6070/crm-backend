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
const databse_1 = require("../config/databse");
const logger_1 = __importDefault(require("../config/logger"));
const createTenantTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableExists = yield databse_1.db.schema.hasTable("tenants");
        if (!tableExists) {
            yield databse_1.db.schema.createTable("tenants", function (table) {
                table.uuid("uuid").primary();
                table.string("db_name").notNullable();
                table.string("db_username").notNullable();
                table.string("db_password").notNullable().unique();
                table.timestamps(true, true);
            });
            logger_1.default.info("Tenant table created successfully");
        }
    }
    catch (error) {
        logger_1.default.error("Error creating tenant table:", error);
        throw error;
    }
});
exports.default = createTenantTable;
