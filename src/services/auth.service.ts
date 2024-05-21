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

  await connection("tokens").where({ id: refreshTokenDoc.id }).del();
};

const refreshAuth = async (connection: Knex, refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      connection,
      refreshToken,
      tokenTypes.REFRESH,
    );
    const user = await userService.getUserByID(
      connection,
      refreshTokenDoc.user,
    );
    if (!user) {
      throw new Error();
    }

    await connection("tokens")
      .where({ token: refreshToken, type: tokenTypes.REFRESH })
      .del();
    return tokenService.generateAuthTokens(user, connection);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "2 Please authenticate");
  }
};

const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string,
) => {
  try {
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
