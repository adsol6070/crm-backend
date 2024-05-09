import { Knex } from "knex";

const createPermission = async (connection: Knex, permissionData: any) => {
  const [newPermission] = await connection("permissions")
    .insert(permissionData)
    .returning("*");
  return newPermission;
};

const getRoles = async (connection: Knex) => {
  const roles = await connection("permissions").select("role").distinct();
  return roles.map((entry) => entry.role);
};

const getPermissionById = async (connection: Knex, permissionId: string) => {
  const permission = await connection("permissions")
    .where({ id: permissionId })
    .first();
  return permission;
};

const getPermissionByRole = async (connection: Knex, role: string) => {
  const permission = await connection("permissions").where({ role }).first();
  return permission;
};

const getAllPermissions = async (connection: Knex) => {
  const permissions = await connection("permissions").select("*");
  return permissions;
};

const updatePermissionById = async (
  connection: Knex,
  permissionId: string,
  permissionData: any,
) => {
  const [updatedPermission] = await connection("permissions")
    .where({ id: permissionId })
    .update(permissionData)
    .returning("*");
  return updatedPermission;
};

const deletePermissionById = async (connection: Knex, permissionId: string) => {
  await connection("permissions").where({ id: permissionId }).delete();
};

export default {
  createPermission,
  getRoles,
  getPermissionById,
  getPermissionByRole,
  getAllPermissions,
  updatePermissionById,
  deletePermissionById,
};
