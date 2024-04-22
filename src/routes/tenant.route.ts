import express from "express";
import { tenantController } from "../controllers";

const router = express.Router();

router.post("/create", tenantController.createTenant);
router.get("/fetchtenant", tenantController.getTenants);
router.patch("/updatetenant/:tenantId", tenantController.editTenant);
router.delete("/delete/:tenantName", tenantController.deleteTenant);

export default router;
