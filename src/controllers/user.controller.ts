import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(connection, req.body, uploadedFile);
  res.status(httpStatus.CREATED).json({ user });
});

export default { createUser };
