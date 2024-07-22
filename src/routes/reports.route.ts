import express from "express";
import { connectionRequest } from "../middlewares/connectionResolver";
import { auth } from "../middlewares/auth";
import { reportsController } from "../controllers";

const router = express.Router();

router
    .route("/getLeadBasedOnStatus")
    .get(auth("Reports"), connectionRequest, reportsController.getLeadsBasedonStatus);

router
    .route("/getCreatedLeadsBasedOnTime")
    .get(auth("Reports"), connectionRequest, reportsController.getCreatedLeadsBasedOnTime);

router
    .route("/getCreatedLeadsBasedOnSource")
    .get(auth("Reports"), connectionRequest, reportsController.getCreatedLeadsBasedOnSource);


export default router;
