import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

const createPermission = async (connection: Knex, permissionData: any) => {
  const newPermissionData = {
    ...permissionData,
    id: uuidv4(),
  };
  const [newPermission] = await connection("permissions")
    .insert(newPermissionData)
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
