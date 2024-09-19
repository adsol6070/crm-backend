import { NextFunction, Request, Response } from "express";
import passport from "passport";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { connectionService, permissionsService } from "../services";
import { commonKnex } from "../config/database";

const verifyCallback =
  (
    req: Request,
    resolve: (value?: unknown) => void,
    reject: (reason?: any) => any,
    requiredRights: string[],
    category: string | null = null,
  ) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "1 Please authenticate"),
      );
    }

    req.user = user;

    if (!category || requiredRights.length === 0) {
      return resolve();
    }

    if (user.role === "superAdmin") {
      return resolve();
    }

    try {
      const tenant = await commonKnex("tenants")
        .where({
          tenantID: user.tenantID,
          active: true,
        })
        .first();
      const connection = await connectionService.getTenantKnex(tenant);

      const permissions = await permissionsService.getPermissionByRole(
        connection,
        user.role,
      );

      if (!permissions) {
        return reject(
          new ApiError(httpStatus.FORBIDDEN, "Role permissions not found"),
        );
      }

      const userRights = permissions.permissions;
      const categoryRights = userRights[category] || {};
      const hasRequiredRights = requiredRights.every((requiredRight) => {
        return categoryRights[requiredRight] === true;
      });

      if (!hasRequiredRights) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }

      resolve();
    } catch (error) {
      return reject(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to verify permissions",
        ),
      );
    }
  };

const auth =
  (category: string | null = null, ...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights, category),
      )(req, res, next);
    })
      .then(() => next())
      .catch((error: ApiError) => next(error));
  };

export { auth };
