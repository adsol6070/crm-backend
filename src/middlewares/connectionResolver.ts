import { createNamespace } from "continuation-local-storage";
import { Request, Response, NextFunction } from "express";
import { connectionService } from "../services";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";

const namespace = createNamespace("tenants");

const connectionRequest = (req: Request, res: Response, next: NextFunction) => {
  const tenantId: string = String(req.fields?.tenantID);

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
