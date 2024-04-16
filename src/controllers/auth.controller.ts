import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";
import { Request, Response } from "express";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.fields);
  const fields = req.fields as any
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(connection, fields);
  res.status(httpStatus.CREATED).json({ user });
});

export default { registerUser };
