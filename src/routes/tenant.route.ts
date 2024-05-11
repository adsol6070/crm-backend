import express from "express";
import { tenantController } from "../controllers";

const router = express.Router();

router.post("/create", tenantController.createTenant);
// router.get("/getTenants", tenantController.getTenants);
// router.patch("/updateTenant/:tenantId", tenantController.editTenant);
// router.delete("/delete/:tenantName", tenantController.deleteTenant);

export default router;
