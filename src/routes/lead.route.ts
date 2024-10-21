import express from "express";
import { auth } from "../middlewares/auth";
import { leadController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import { parseFile } from "../middlewares/csvParser";
import { LeadPermissions, Permission } from "../config/permissions";
import upload from "../middlewares/multer";

const router = express.Router();

router
  .route("/updateSelected")
  .patch(
    auth("Leads", LeadPermissions.UPDATESELECETED),
    connectionRequest,
    leadController.updateLeadsBulk,
  );
// Visa Category Routes
router
  .route("/getVisaCategory")
  .post(connectionRequest, leadController.getVisaCategory);

router
  .route("/visaCategory")
  .get(auth("Visas"), connectionRequest, leadController.getVisaCategory)
  .post(auth("Visas"), connectionRequest, leadController.createVisaCategory);

router
  .route("/visaCategory/:visaCategoryId")
  .get(auth("Visas"), connectionRequest, leadController.getVisaCategoryById)
  .patch(auth("Visas"), connectionRequest, leadController.updateVisaCategory)
  .delete(
    auth("Visas"),
    connectionRequest,
    leadController.deleteVisaCategoryById,
  );

router
  .route("/deleteSelectedCategories")
  .post(
    auth("Visas", LeadPermissions.DELETESELECTEDCATEGORIES),
    connectionRequest,
    leadController.deleteSelectedVisaCategories,
  );

// Lead Routes
router.route("/createLead").post(connectionRequest, leadController.createLead);

router
  .route("/")
  .get(
    auth("Leads", LeadPermissions.VIEW),
    connectionRequest,
    leadController.getAllLeads,
  )
  .post(
    auth("Leads", LeadPermissions.CREATE),
    connectionRequest,
    leadController.createLead,
  )
  .delete(
    auth("Leads", LeadPermissions.DELETEALL),
    connectionRequest,
    leadController.deleteAllLeads,
  );

router
  .route("/downloadFullCsv/:category")
  .get(auth("manageLeads"), connectionRequest, leadController.downloadCsv)

router
  .route("/getDocumentStatus")
  .get(auth("manageLeads"), connectionRequest, leadController.documentStatus)

router
  .route("/:leadId")
  .get(
    auth("Leads", LeadPermissions.VIEW),
    connectionRequest,
    leadController.getLeadById,
  )
  .patch(
    auth("Leads", LeadPermissions.EDIT),
    connectionRequest,
    leadController.updateLeadById,
  )
  .delete(
    auth("Leads", LeadPermissions.DELETE),
    connectionRequest,
    leadController.deleteLeadById,
  );

router
  .route("/deleteSelected")
  .post(
    auth("Leads", LeadPermissions.DELETESELECTED),
    connectionRequest,
    leadController.deleteSelectedLeads,
  );

router
  .route("/getSpecificLeads/:userId")
  .get(auth("getLeads"), connectionRequest, leadController.getSpecificLeads);

router
  .route("/leadAssignee")
  .get(
    auth("getLeadAssignes"),
    connectionRequest,
    leadController.getAllAssignes,
  )
  .post(
    auth("Leads", LeadPermissions.ASSIGN),
    connectionRequest,
    leadController.assignLead,
  );

router
  .route("/leadAssignee/:leadId")
  .get(
    auth("getLeadAssignes"),
    connectionRequest,
    leadController.getLeadAssigneeById,
  );

router
  .route("/leadHistory/:leadId")
  .get(
    auth("Leads", LeadPermissions.HISTORY),
    connectionRequest,
    leadController.getLeadHistory,
  );

router
  .route("/importLeads")
  .post(
    auth("Leads", LeadPermissions.IMPORTBULK),
    upload.single("leadFile"),
    parseFile,
    connectionRequest,
    leadController.uploadLead,
  );

router
  .route("/documentChecklist/:leadId")
  .get(
    auth("manageLeads"),
    connectionRequest,
    leadController.getLeadDocumentsZip,
  )
  .post(
    auth("manageLeads"),
    upload.array("documents", 10),
    connectionRequest,
    leadController.uploadLeadChecklists,
  );

router
  .route("/getDocument/:leadId")
  .get(auth("manageLeads"), connectionRequest, leadController.getDocuments)
  .delete(
    auth("manageLeads"),
    connectionRequest,
    leadController.deleteDocuments,
  );

router
  .route("/getSingleDocument/:leadId/:filename")
  .get(
    auth("manageLeads"),
    connectionRequest,
    leadController.getSingleDocuments,
  )
  .patch(
    auth("manageLeads"),
    upload.single("documents"),
    connectionRequest,
    leadController.updateSingleDocuments,
  )
  .delete(
    auth("manageLeads"),
    connectionRequest,
    leadController.deleteSingleDocument,
  );

router
  .route("/getSingleDocumentUrl/:leadId/:filename")
  .get(
    auth("manageLeads"),
    connectionRequest,
    leadController.getSingleDocumentURL,
  );

router
  .route("/uploadSingleDocument")
  .post(
    auth("manageLeads"),
    upload.single("documents"),
    connectionRequest,
    leadController.uploadSingleDocument,
  );

router
  .route("/leadStatus/:leadId")
  .patch(auth(), connectionRequest, leadController.updateLeadStatus);

router
  .route("/leadNotes/:leadId")
  .get(auth("getLeads"), connectionRequest, leadController.getNotes)
  .post(
    auth("Leads", LeadPermissions.ADDNOTES),
    connectionRequest,
    leadController.createLeadNote,
  )
  .patch(auth("manageLeads"), connectionRequest, leadController.updateLeadNote)
  .delete(
    auth("Leads", LeadPermissions.DELETENOTES),
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
