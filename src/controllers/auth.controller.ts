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
import ApiError from "../utils/ApiError";
import { tokenTypes } from "../config/tokens";

const register = catchAsync(async (req: Request, res: Response) => {
  const uploadedFile = req.file as any;
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await userService.createUser(connection, req.body, uploadedFile);
  res.status(httpStatus.CREATED).json({ user });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const connection = await connectionService.getCurrentTenantKnex();
  const user = await authService.loginWithEmailAndPassword(
    connection,
    email,
    password,
  );
  const tokens = await tokenService.generateAuthTokens(user, connection);
  res.status(httpStatus.OK).json({ user, tokens });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();

  console.log("Request Body:", req.body);

  const { tenantID, user } = req.body;
  await connection("tokens")
    .where({
      user,
      tenantID,
      type: tokenTypes.REFRESH,
    })
    .del();

  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const { tenantID, userID } = req.body;

  const refreshToken = await connection("tokens")
    .where({ user: userID, tenantID })
    .first();

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token not found");
  }

  const tokens = await authService.refreshAuth(connection, refreshToken.token);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    connection,
    req.body.email,
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  await authService.resetPassword(
    connection,
    req.body.token,
    req.body.password,
  );
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
