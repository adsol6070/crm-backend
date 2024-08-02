import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import commonService from "./common.service";
import tokenService from "./token.service";
import { tokenTypes } from "../config/tokens";
import userService from "./user.service";

const loginWithEmailAndPassword = async (
  connection: Knex,
  email: string,
  password: string,
) => {
  const user = await connection("users").where({ email }).first();
  if (
    !user ||
    !(await commonService.isPasswordMatch(password, user.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

const logout = async (connection: Knex, refreshToken: string) => {
  const refreshTokenDoc = await connection("tokens")
    .select("*")
    .where({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    })
    .first();
  if (!refreshTokenDoc) {
    return;
  }

  const reponse = await connection("tokens")
    .where({ id: refreshTokenDoc.id })
    .del();
};

const refreshAuth = async (connection: Knex, refreshToken: string) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    connection,
    refreshToken,
    tokenTypes.REFRESH,
  );

  const user = await userService.getUserByID(connection, refreshTokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return tokenService.generateAuthTokens(user, connection);
};

const resetPassword = async (
  connection: Knex,
  resetPasswordToken: string,
  newPassword: string,
) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      connection,
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD,
    );
    const user = await userService.getUserByID(
      connection,
      resetPasswordTokenDoc.user,
    );
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(connection, user.id, {
      password: newPassword,
    });
    await connection("tokens")
      .where({ user: user.id, type: tokenTypes.RESET_PASSWORD })
      .del();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

export default {
  loginWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
};
