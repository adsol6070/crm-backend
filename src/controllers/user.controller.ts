import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { v4 as uuidv4 } from "uuid";
import generator from "generate-password";
import slugify from "slugify";
import { db } from "../config/databse";
import { tenantService } from "../services";

const createUser = catchAsync(async (req, res) => {
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

export default { createUser };
