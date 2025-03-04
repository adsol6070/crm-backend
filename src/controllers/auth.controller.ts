import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import {
  authService,
  connectionService,
  emailService,
  tokenService,
  userService,
} from "../services";
import { Request, Response } from "express";

const register = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(connection, req.body, uploadedFile);
  res.status(httpStatus.CREATED).json({ user });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const connection = await connectionService.getConnection();
  const user = await authService.loginWithEmailAndPassword(
    connection,
    email,
    password,
  );
  const tokens = await tokenService.generateAuthTokens(user, connection);
  res.status(httpStatus.OK).json({ user, tokens });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getConnection();
  await authService.logout(connection, req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getConnection();
  const tokens = await authService.refreshAuth(
    connection,
    req.body.refresh_token,
  );
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getConnection();
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    connection,
    req.body.email,
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // await authService.resetPassword(req.query.token, req.body.password);
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
