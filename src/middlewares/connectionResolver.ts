import { createNamespace } from "continuation-local-storage";
import { Request, Response, NextFunction } from "express";
import { connectionService } from "../services";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";

declare global {
  namespace Express {
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
  }
}

const namespace = createNamespace("tenants");

const connectionRequest = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.body.tenantID || req.user?.tenantID;
  // Check if tenantID is present
  if (!tenantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID is required");
  }

  namespace.run(() => {
    namespace.set(
      "connection",
      connectionService.getTenantConnection(tenantId),
    );
    next();
  });
};

export { connectionRequest };
