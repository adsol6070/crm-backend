import express from "express";
import { auth } from "../middlewares/auth";
import { checklistController, userController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import { Permission } from "../config/permissions";

const router = express.Router();

router
    .route("/")
    .post(
        auth("Checklists", Permission.CREATE),
        connectionRequest,
        checklistController.createChecklist
    )
    .get(
        auth("Checklists", Permission.READ),
        connectionRequest,
        checklistController.getChecklists,
    );

router
    .route("/:checklistId")
    .patch(
        auth("Checklists", Permission.UPDATE),
        connectionRequest,
        checklistController.updateChecklistById
      )
    .delete(
        auth("Checklists", Permission.DELETE),
        connectionRequest,
        checklistController.deleteChecklistsById
    )


router
    .route("/:visaType")
    .get(
        auth("Checklists", Permission.READ),
        connectionRequest,
        checklistController.getChecklistByVisaType
    )


export default router;
