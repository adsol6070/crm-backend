import express from "express";
import { tenantController } from "../controllers";

const router = express.Router();

router.post("/create", tenantController.createTenant);

export default router;
