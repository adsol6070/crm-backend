"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const isEmailTaken = async (connection, tableName, email) => {
    const user = await connection(tableName).where({ email }).first();
    return !!user;
};
const isPasswordMatch = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.default = { isEmailTaken, isPasswordMatch };
