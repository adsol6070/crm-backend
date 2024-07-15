"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRights = exports.roles = void 0;
const Permissions = {
    READ_USERS: "getUsers",
    MANAGE_USERS: "manageUsers",
    MANAGE_SETTINGS: "manageSettings",
    SYSTEM_MAINTENANCE: "systemMaintenance",
    READ_BLOGS: "getBlogs",
    MANAGE_BLOGS: "manageBlogs",
};
const allRoles = {
    user: [],
    admin: [
        Permissions.READ_USERS,
        Permissions.MANAGE_USERS,
        Permissions.READ_BLOGS,
        Permissions.MANAGE_BLOGS,
    ],
    superAdmin: [
        Permissions.READ_USERS,
        Permissions.MANAGE_USERS,
        Permissions.MANAGE_SETTINGS,
        Permissions.SYSTEM_MAINTENANCE,
        Permissions.READ_BLOGS,
        Permissions.MANAGE_BLOGS,
    ],
};
const roles = Object.keys(allRoles);
exports.roles = roles;
const roleRights = new Map(Object.entries(allRoles));
exports.roleRights = roleRights;
