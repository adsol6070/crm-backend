import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { connectionService } from "../services";
import { commonKnex } from "../config/databse";

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

interface Tenant {
  tenantID: string;
  name: string;
  db_connection: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
  active: boolean;
}

const connectionRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { tenantID } = req.body as { tenantID: string };
  const tenantId = tenantID || req.user?.tenantID;
  if (!tenantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID is required");
  }
  try {
    const tenant: Tenant | undefined = await commonKnex("tenants")
      .where({
        tenantID: tenantId,
        active: true,
      })
      .first();

    if (!tenant) {
      throw new ApiError(httpStatus.NOT_FOUND, "Tenant not found");
    }
    connectionService.runWithTenantContext(tenant, () => next());
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to set tenant context",
    );
  }
};

export { connectionRequest };
