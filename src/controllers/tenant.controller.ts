import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { v4 as uuidv4 } from "uuid";
import generator from "generate-password";
import slugify from "slugify";
import { db } from "../config/databse";
import { tenantService } from "../services";
import { Request, Response } from "express";

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
  const { tenantName } = req.params; 
    const { password, uuid } = await db("tenants")
      .select("db_password as password", "uuid")
      .where({ db_name: tenantName })
      .first();

    await tenantService.down({ tenantName, password, uuid });

    res.status(httpStatus.NO_CONTENT).send({ message: "Tenant deleted successfully" });
});

const getTenants = catchAsync(async (req: Request, res: Response) => {
    const tenants = await db("tenants").select("*");
    res.status(httpStatus.OK).send(tenants);
});

const editTenant = catchAsync(async (req: Request, res: Response) => {
  const { tenantId } = req.params; 
  const { newData } = req.body; 
  const modifiedBodyData = {
    ...newData,
    db_name: slugify(newData.db_name.toLowerCase(), "_")
  }
  const getTenant = await db('tenants')
  .select('*')
  .where({ uuid: tenantId })
  .first();
    const updatedTenant = await tenantService.updateTenant( { tenantId }, modifiedBodyData , getTenant);
    res.status(httpStatus.OK).send(updatedTenant);
});

export default { createTenant, deleteTenant, getTenants, editTenant};
