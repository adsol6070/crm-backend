import express from "express";
import { auth } from "../middlewares/auth";
import { leadController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";

const router = express.Router();

router
    .route("/")
    .get(auth("getLeads"), connectionRequest, leadController.getAllLeads)
    .post(auth("manageLeads"),
        connectionRequest,
        leadController.createLead,
    );

router
    .route("/:leadId")
    .get(auth("getLeads"), connectionRequest, leadController.getLeadById)
    .patch(
        auth("manageLeads"),
        connectionRequest,
        leadController.updateLeadById,
    )
    .delete(
        auth("manageLeads"),
        connectionRequest,
        leadController.deleteLeadById,
    );


export default router;