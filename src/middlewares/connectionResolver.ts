import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { connectionService } from "../services";
import { commonKnex } from "../config/database";

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

const findTenant = async (
  tenantID: string | undefined,
  userEmail: string | undefined,
): Promise<Tenant | null> => {
  if (tenantID) {
    const tenant = await commonKnex("tenants")
      .where({ tenantID, active: true })
      .first();
    return tenant || null;
  } else if (userEmail) {
    const tenant = await commonKnex("users")
      .join("tenants", "users.tenantID", "tenants.tenantID")
      .where("users.email", userEmail)
      .andWhere("tenants.active", true)
      .select(
        "tenants.tenantID",
        "tenants.name",
        "tenants.db_connection",
        "tenants.active",
      )
      .first();

    return tenant || null;
  }
  return null;
};

const connectionRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  console.log("Request User:", req.user);
  const tenantID = req.body.tenantID || req.user?.tenantID;
  const userEmail = req.body.email || req.user?.email;


  console.table({ TenantID: tenantID, UserEmail: userEmail })

  try {
    const tenant = await findTenant(tenantID, userEmail);

    if (!tenant) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Tenant not found using ${tenantID ? "tenantID" : "email"}`,
      );
    }
    connectionService.runWithTenantContext(tenant, () => next());
  } catch (error) {
    next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to set tenant context",
      ),
    );
  }
};

export { connectionRequest };
