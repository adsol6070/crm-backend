import express from "express";
import { auth } from "../middlewares/auth";
import { leadController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";
import { parseFile } from "../middlewares/csvParser";
import { Permission } from "../config/permissions";

const router = express.Router();

router
  .route("/visaCategory")
  .get(auth("Visas", Permission.READ), connectionRequest, leadController.getVisaCategory)
  .post(
    auth("Visas", Permission.CREATE),
    connectionRequest,
    leadController.createVisaCategory,
  );

router
  .route("/visaCategory/:visaCategoryId")
  .get(
    auth("Visas", Permission.READ),
    connectionRequest,
    leadController.getVisaCategoryById,
  )
  .patch(
    auth("Visas", Permission.UPDATE),
    connectionRequest,
    leadController.updateVisaCategory,
  )
  .delete(
    auth("Visas", Permission.DELETE),
    connectionRequest,
    leadController.deleteVisaCategoryById,
  );

router
  .route("/")
  .get(auth("getLeads"), connectionRequest, leadController.getAllLeads)
  .post(auth("manageLeads"),
    connectionRequest,
    leadController.createLead,
  )
  .delete(auth("manageLeads"), connectionRequest, leadController.deleteAllLeads);

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


router
  .route("/:userId")
  .get(auth("getLeads"), connectionRequest, leadController.getSpecificLeads)


router
  .route("/leadAssignee")
  .get(auth("getLeadAssignes"), connectionRequest, leadController.getAllAssignes)
  .post(auth("manageAssignes"),
    connectionRequest,
    leadController.assignLead,
  );


router
  .route("/leadAssignee/:leadId")
  .get(auth("getLeadAssignes"), connectionRequest, leadController.getLeadAssigneeById);

router
  .route("/leadHistory/:leadId")
  .get(auth("manageLeads"), connectionRequest, leadController.getLeadHistory);

router
  .route("/importLeads")
  .post(auth("manageLeads"),
    upload.single("leadFile"),
    parseFile,
    connectionRequest,
    leadController.uploadLead
  );

router
  .route("/documentChecklist/:leadId")
  .get(auth("manageLeads"), connectionRequest, leadController.getLeadDocumentsZip)
  .post(auth("manageLeads"),
    upload.array("documents", 10),
    connectionRequest,
    leadController.uploadLeadChecklists
  );

router
  .route("/getDocument/:leadId")
  .get(auth("manageLeads"), connectionRequest, leadController.getDocuments)
  .delete(auth("manageLeads"), connectionRequest, leadController.deleteDocuments);

router
  .route("/getSingleDocument/:leadId/:filename")
  .get(auth("manageLeads"), connectionRequest, leadController.getSingleDocuments)
  .patch(auth("manageLeads"), upload.single('documents'), connectionRequest, leadController.updateSingleDocuments
  )
  .delete(auth("manageLeads"), connectionRequest, leadController.deleteSingleDocument);

router
  .route("/leadStatus/:leadId")
  .patch(auth("getLeads"), connectionRequest, leadController.updateLeadStatus)

router
  .route("/leadNotes/:leadId")
  .get(auth("getLeads"), connectionRequest, leadController.getNotes)
  .post(auth("manageLeads"), connectionRequest, leadController.createLeadNote)
  .patch(
    auth("manageLeads"),
    connectionRequest,
    leadController.updateLeadNote,
  )
  .delete(
    auth("manageLeads"),
    connectionRequest,
    leadController.deleteAllNotes,
  );

router
  .route("/leadNote/:noteId")
  .patch(auth("manageLeads"), connectionRequest, leadController.updateLeadNote)
  .delete(
    auth("manageLeads"),
    connectionRequest,
    leadController.deleteLeadNoteById,
  );

export default router;