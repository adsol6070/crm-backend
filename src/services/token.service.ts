import jwt from "jsonwebtoken";
import { tokenTypes } from "../config/tokens";
import config from "../config/config";

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

const generateToken = (
  userId: string,
  tenantID: string,
  expires: number,
  type: string,
  secret: string,
) => {
  const payload = {
    sub: userId,
    tenantID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expires,
    type,
  };
  return jwt.sign(payload, secret);
};

const generateAuthTokens = async (user: User) => {
  const accessToken = generateToken(
    user.id,
    user.tenantID,
    config.jwt.accessExpirationTime,
    tokenTypes.ACCESS,
    config.jwt.secret,
  );
  return {
    accessToken,
  };
};

export default {
  generateToken,
  generateAuthTokens,
};
