import express from "express";
import { tenantController } from "../controllers";

const router = express.Router();

router.post("/create", tenantController.createTenant);
router.get("/getOrganizations", tenantController.getTenants);
router.get("/getSuperusers", tenantController.getSuperusers);
router.post("/disable-tenant", tenantController.toggleTenant);
// router.patch("/updateTenant/:tenantId", tenantController.editTenant);
router.delete("/delete-tenant/:tenantID", tenantController.deleteTenant);

export default router;
