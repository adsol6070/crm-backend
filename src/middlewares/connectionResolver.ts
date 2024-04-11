import Joi from "joi";
import { createNamespace } from "continuation-local-storage";
import { Request, Response, NextFunction } from "express";
import { connectionService } from "../services";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";

const namespace = createNamespace("tenants");

interface TenantQueryParams {
  tenantId: string;
}

const connectionRequest = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object<TenantQueryParams>({
    tenantId: Joi.string().guid({ version: "uuidv4" }).required(),
  });
  const { error } = schema.validate(req.query);

  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }

  const tenantId = req.query.tenantId as string;

  namespace.run(() => {
    namespace.set(
      "connection",
      connectionService.getTenantConnection(tenantId),
    );
    next();
  });
};

export { connectionRequest };
