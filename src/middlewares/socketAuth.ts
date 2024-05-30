import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { commonKnex } from "../config/database";
import { connectionService } from "../services";
import { Knex } from "knex";
import config from "../config/config";

interface CustomSocket extends Socket {
  data: {
    user?: any;
    connection?: Knex;
  };
}

export const socketAuth = async (
  socket: CustomSocket,
  next: (err?: Error) => void,
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const tenant = await commonKnex("tenants")
      .where({
        tenantID: decoded.tenantID,
        active: true,
      })
      .first();

    if (!tenant) {
      return next(new ApiError(httpStatus.BAD_REQUEST, "Tenant not found"));
    }

    const connection = await connectionService.getTenantKnex(tenant);
    socket.data.user = await connection("users")
      .where({ id: decoded.sub })
      .first();
    if (!socket.data.user) {
      return next(new ApiError(httpStatus.BAD_REQUEST, "User not found"));
    }
    socket.data.connection = connection;
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Authentication Error"));
  }
};
