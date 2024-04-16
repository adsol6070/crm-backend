import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getConnection();
  const uploadFile = req.file as any
  const user = await userService.createUser(connection, req.body, uploadFile);
  res.status(httpStatus.CREATED).json({ user });
});

export default { registerUser };
