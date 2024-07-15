"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const createPermission = async (connection, permissionData) => {
    const newPermissionData = {
        ...permissionData,
        id: (0, uuid_1.v4)(),
    };
    const [newPermission] = await connection("permissions")
        .insert(newPermissionData)
        .returning("*");
    return newPermission;
};
const getRoles = async (connection) => {
    const roles = await connection("permissions").select("role").distinct();
    return roles.map((entry) => entry.role);
};
const getPermissionById = async (connection, permissionId) => {
    const permission = await connection("permissions")
        .where({ id: permissionId })
        .first();
    return permission;
};
const getPermissionByRole = async (connection, role) => {
    const permission = await connection("permissions").where({ role }).first();
    return permission;
};
const getAllPermissions = async (connection) => {
    const permissions = await connection("permissions").select("*");
    return permissions;
};
const updatePermissionById = async (connection, permissionId, permissionData) => {
    const [updatedPermission] = await connection("permissions")
        .where({ id: permissionId })
        .update(permissionData)
        .returning("*");
    return updatedPermission;
};
const deletePermissionById = async (connection, permissionId) => {
    await connection("permissions").where({ id: permissionId }).delete();
};
exports.default = {
    createPermission,
    getRoles,
    getPermissionById,
    getPermissionByRole,
    getAllPermissions,
    updatePermissionById,
    deletePermissionById,
};
