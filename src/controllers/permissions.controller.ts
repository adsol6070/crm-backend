import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, permissionsService } from "../services";
import ApiError from "../utils/ApiError";

const createPermission = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const permission = await permissionsService.createPermission(
    connection,
    req.body,
  );
  res.status(httpStatus.CREATED).json(permission);
});

const getPermission = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const permission = await permissionsService.getPermissionById(
    connection,
    req.params.id,
  );
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, "Permission not found");
  }
  res.status(httpStatus.OK).json(permission);
});

const getPermissionByRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const permission = await permissionsService.getPermissionByRole(
      connection,
      req.body.role,
    );
    if (!permission) {
      throw new ApiError(httpStatus.NOT_FOUND, "Permission not found");
    }

    res.status(httpStatus.OK).json(permission);
  },
);

const getAllPermissions = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const permissions = await permissionsService.getAllPermissions(connection);
  res.status(httpStatus.OK).json(permissions);
});

const updatePermission = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const updatedPermission = await permissionsService.updatePermissionById(
    connection,
    req.params.permissionId,
    req.body,
  );
  res.status(httpStatus.OK).json(updatedPermission);
});

const deletePermission = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  await permissionsService.deletePermissionById(
    connection,
    req.params.permissionId,
  );
  res.status(httpStatus.NO_CONTENT).send();
});

const getRoles = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const roles = await permissionsService.getRoles(connection);
  if (!roles || roles.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No roles found");
  }
  res.status(httpStatus.OK).json(roles);
});

export default {
  createPermission,
  getPermission,
  getPermissionByRole,
  getAllPermissions,
  updatePermission,
  deletePermission,
  getRoles,
};
