import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(
    connection,
    req.body,
    req.user?.tenantID,
    uploadedFile,
  );
  res.status(httpStatus.CREATED).json({ user });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getConnection();
  const user = await userService.getUserByID(connection, req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

export default { createUser, getUser };
