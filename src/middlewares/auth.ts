import { NextFunction, Request, Response } from "express";
import passport from "passport";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { roleRights } from "../config/roles";

const verifyCallback = (req: Request, resolve: (value?: unknown), reject:, requiredRights) => async (err: any, user:any, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate"))
  }
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights?.includes(requiredRight));
    if(!hasRequiredRights){
      return reject(new ApiError(httpStatus.FORBIDDEN, "Invaid Role"))
    }
  }
  resolve();
};

const auth = (...requiredRights) => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate("jwt", { session: false }, verifyCallback(req, resolve, reject, requiredRights))
  });
};

export { auth };