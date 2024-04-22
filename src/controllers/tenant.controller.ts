import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { v4 as uuidv4 } from "uuid";
import generator from "generate-password";
import slugify from "slugify";
import { db } from "../config/databse";
import { tenantService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";

const createTenant = catchAsync(async (req: Request, res: Response) => {
  const { organization } = req.body;

  const tenantName = slugify(organization.toLowerCase(), "_");
  const password = generator.generate({ length: 12, numbers: true });
  const uuid = uuidv4();
  const tenant = {
    uuid,
    db_name: tenantName,
    db_username: tenantName,
    db_password: password,
  };
  await db("tenants").insert(tenant);
  await tenantService.up({ tenantName, password, uuid });
  res.status(httpStatus.OK).send({ tenant: { ...tenant } });
});

const deleteTenant = catchAsync(async (req: Request, res: Response) => {
  const { tenantName } = req.params; // Assuming tenantName is extracted from the request parameters
    // Retrieve the password and uuid from the database or another source
    const { password, uuid } = await db("tenants")
      .select("db_password as password", "uuid")
      .where({ db_name: tenantName })
      .first();

    // Call the deleteTenant function to delete the tenant
    await tenantService.down({ tenantName, password, uuid });

    // Send a success response indicating successful deletion
    res.status(httpStatus.OK).send({ message: "Tenant deleted successfully" });
});
export default { createTenant, deleteTenant };
