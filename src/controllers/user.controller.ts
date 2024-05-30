import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const userId = req.body.userId;
  const userProfile = await userService.getUserProfile(connection, userId);
  res.status(httpStatus.OK).json(userProfile);
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await userService.createUser(
    connection,
    req.body,
    uploadedFile,
    // req.user?.tenantID,
  );
  const message = "User created successfully.";
  res.status(httpStatus.CREATED).json({ message, user });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await userService.getUserByID(connection, req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const getUserImage = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const userId = req.params.userId;
  const imagePath = await userService.getUserImageById(connection, userId);
  res.status(httpStatus.OK).sendFile(imagePath);
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const users = await userService.getAllUsers(connection);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, "Users not found");
  }

  res.status(httpStatus.OK).json({ users });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  console.log("Update Controller", req.body)
  const connection = await connectionService.getCurrentTenantKnex();
  await userService.updateUserById(
    connection,
    req.params.userId,
    req.body,
    uploadedFile,
  );
  const message = "User updated successfully.";
  res.status(httpStatus.OK).json({ message });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await userService.deleteUserById(connection, req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  getUserProfile,
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserImage,
};
