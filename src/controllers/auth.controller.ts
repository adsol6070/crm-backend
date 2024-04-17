import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import {
  authService,
  connectionService,
  tokenService,
  userService,
} from "../services";
import { Request, Response } from "express";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(connection, req.body, uploadedFile);
  res.status(httpStatus.CREATED).json({ user });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const connection = await connectionService.getConnection();
  const user = await authService.loginWithEmailAndPassword(
    connection,
    email,
    password,
  );
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json({ user, token: token.accessToken });
});

export default { registerUser, loginUser };
