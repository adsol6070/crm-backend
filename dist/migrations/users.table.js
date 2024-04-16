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
const logger_1 = __importDefault(require("../config/logger"));
const createUsersTable = (tenant) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield tenant.schema.createTable("users", function (table) {
            table.increments("id").primary();
            table.uuid("tenantID").notNullable();
            table.string("firstname").notNullable();
            table.string("lastname").notNullable();
            table.string("email").notNullable().unique();
            table.string("password").notNullable();
            table.string("phone").notNullable();
            table.string("profileImage");
            table.boolean("isEmailVerified").defaultTo(false);
            table.string("role").notNullable();
            table.timestamps(true, true);
        });
    }
    catch (error) {
        logger_1.default.error("Error creating user table:", error);
        throw error;
    }
});
exports.default = createUsersTable;
