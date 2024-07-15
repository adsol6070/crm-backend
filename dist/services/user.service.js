"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const common_service_1 = __importDefault(require("./common.service"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const getUserProfile = async (connection, userId) => {
    const user = await connection("users")
        .select("id", "tenantID", "firstname", "lastname", "email", "phone", "city", "address", "profileImage", "isEmailVerified", "role", "online")
        .where({ id: userId })
        .first();
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const createUser = async (connection, user, file, tenantID) => {
    try {
        if (await common_service_1.default.isEmailTaken(connection, "users", user.email)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Email already taken");
        }
        const hashedPassword = await bcryptjs_1.default.hash(user.password, 8);
        const id = (0, uuid_1.v4)();
        const insertedUser = {
            id: id,
            tenantID: user.tenantID ?? tenantID,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: hashedPassword,
            phone: user.phone,
            city: user.city,
            address: user.address,
            profileImage: file ? file.filename : null,
            isEmailVerified: user.isEmailVerified ?? false,
            role: user.role ?? "user",
        };
        const commonUser = {
            id: id,
            tenantID: user.tenantID ?? tenantID,
            email: user.email,
        };
        await connection("users").insert(insertedUser);
        await (0, database_1.commonKnex)("users").insert(commonUser);
        return insertedUser;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, error.message);
    }
};
const getUserByID = async (connection, id) => {
    return await connection("users").where({ id }).first();
};
const getUserImageById = async (connection, id) => {
    const user = await connection("users").where({ id }).first();
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User not found");
    }
    const image = path_1.default.join(__dirname, "..", "uploads", user.tenantID, "User", user.profileImage);
    return image;
};
const getUserByEmail = async (connection, email) => {
    return await connection("users").where({ email }).first();
};
const getAllUsers = async (connection) => {
    const users = await connection("users").select("id", "tenantID", "firstname", "lastname", "email", "phone", "city", "address", "profileImage", "isEmailVerified", "role");
    return users;
};
const updateUserById = async (connection, userId, updateBody, file) => {
    const { uploadType, last_active, ...filteredUpdateBody } = updateBody;
    const user = await getUserByID(connection, userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (filteredUpdateBody.password) {
        filteredUpdateBody.password = await bcryptjs_1.default.hash(filteredUpdateBody.password, 8);
    }
    if (file) {
        filteredUpdateBody.profileImage = file.filename;
    }
    const updates = Object.entries(filteredUpdateBody).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            const userKey = key;
            acc[userKey] = value;
        }
        return acc;
    }, {});
    const updatedUser = await connection("users")
        .where({ id: userId })
        .update(updates)
        .returning("*");
    if (updates.email && updates.tenantID) {
        const commonUpdates = {
            email: updates.email,
            tenantID: updates.tenantID,
        };
        await (0, database_1.commonKnex)("users")
            .where({ id: userId })
            .update(commonUpdates)
            .returning("*");
    }
    if (updatedUser.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found after update");
    }
    return updatedUser[0];
};
const deleteUserById = async (connection, userId) => {
    const user = await getUserByID(connection, userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const deletedCount = await connection("users").where({ id: userId }).delete();
    await (0, database_1.commonKnex)("users").where({ id: userId }).delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No user found to delete");
    }
    return deletedCount;
};
exports.default = {
    getUserProfile,
    createUser,
    getUserByID,
    getUserImageById,
    getAllUsers,
    getUserByEmail,
    updateUserById,
    deleteUserById,
};
