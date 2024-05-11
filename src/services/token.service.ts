import jwt from "jsonwebtoken";
import { tokenTypes } from "../config/tokens";
import config from "../config/config";
import { Knex } from "knex";
import userService from "./user.service";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  tenantID: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  profileImage: string;
  isEmailVerified: boolean;
  role: string;
  created_at: Date;
  updated_at: Date;
}

const generateToken = async (
  userId: string,
  tenantID: string,
  role: string,
  expires: number,
  type: string,
  secret: string,
) => {
  const payload = {
    sub: userId,
    tenantID,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expires,
    type,
  };

  return jwt.sign(payload, secret);
};

const saveToken = async (
  connection: Knex,
  token: string,
  userId: string,
  tenantID: string,
  expires: number,
  type: string,
  blacklisted: boolean = false,
) => {
  const tokenDoc = await connection("tokens")
    .insert({
      id: uuidv4(),
      tenantID,
      user: userId,
      token,
      expires,
      type,
      blacklisted,
    })
    .returning("*");
  return tokenDoc;
};

const verifyToken = async (connection: Knex, token: string, type: string) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await connection("tokens")
    .select("*")
    .where({ token, type, user: payload.sub, blacklisted: false })
    .first();
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

const generateAuthTokens = async (user: User, connection: Knex) => {
  const accessToken = await generateToken(
    user.id,
    user.tenantID,
    user.role,
    config.jwt.accessExpirationTime,
    tokenTypes.ACCESS,
    config.jwt.secret,
  );
  const refreshToken = await generateToken(
    user.id,
    user.tenantID,
    user.role,
    config.jwt.refreshExpirationTime,
    tokenTypes.REFRESH,
    config.jwt.secret,
  );

  await saveToken(
    connection,
    refreshToken,
    user.id,
    user.tenantID,
    config.jwt.refreshExpirationTime,
    tokenTypes.REFRESH,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const generateResetPasswordToken = async (connection: Knex, email: string) => {
  const user = await userService.getUserByEmail(connection, email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const resetPasswordToken = await generateToken(
    user.id,
    user.tenantID,
    user.role,
    config.jwt.resetPasswordExpirationMinutes,
    tokenTypes.RESET_PASSWORD,
    config.jwt.secret,
  );
  await saveToken(
    connection,
    resetPasswordToken,
    user.id,
    user.tenantID,
    config.jwt.resetPasswordExpirationMinutes,
    tokenTypes.RESET_PASSWORD,
  );
  return resetPasswordToken;
};

export default {
  generateToken,
  generateAuthTokens,
  verifyToken,
  generateResetPasswordToken,
};
