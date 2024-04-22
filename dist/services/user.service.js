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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createUser = (connection, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(user.password, 8);
        const insertedUser = {
            tenantID: user.tenantID,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            profileImage: user.profileImage,
            isEmailVerified: false,
            role: user.role,
        };
        yield connection("users").insert(insertedUser);
        return insertedUser;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
const getUserByEmail = (connection, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield connection("users").where({ email }).first();
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
});
exports.default = { createUser, getUserByEmail };
