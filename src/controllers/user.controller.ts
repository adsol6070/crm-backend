import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import path from "path";
import fs from "fs";

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
    req.user?.tenantID,
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

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const userId = req.params.userId;
  const uploadedFile = req.file as any;

  if (!uploadedFile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  // Validate user exists
  const user = await userService.getUserByID(connection, userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Update user profile image
  const updatedUser = await userService.updateUserById(
    connection,
    userId,
    { profileImage: uploadedFile.filename },
    uploadedFile,
  );

  // Remove old image file if exists
  if (user.profileImage) {
    const oldImagePath = path.join(
      __dirname,
      "..",
      "uploads",
      user.tenantID as string,
      "User",
      user.profileImage,
    );
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  res.status(httpStatus.OK).json({
    message: "Profile image updated successfully",
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await userService.deleteUserById(connection, req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSelectedUsers = catchAsync(async (req: Request, res: Response) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send("No user IDs provided");
  }

  const connection = await connectionService.getCurrentTenantKnex();
  await userService.deleteUsersByIds(connection, userIds);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteAllUsers = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  await userService.deleteAllUsers(connection);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  getUserProfile,
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateProfileImage,
  deleteUser,
  getUserImage,
  deleteSelectedUsers,
  deleteAllUsers,
};
