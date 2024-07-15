"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const controllers_1 = require("../controllers");
const connectionResolver_1 = require("../middlewares/connectionResolver");
const csvParser_1 = require("../middlewares/csvParser");
const permissions_1 = require("../config/permissions");
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = express_1.default.Router();
router
    .route("/visaCategory")
    .get((0, auth_1.auth)("Visas", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.leadController.getVisaCategory)
    .post((0, auth_1.auth)("Visas", permissions_1.Permission.CREATE), connectionResolver_1.connectionRequest, controllers_1.leadController.createVisaCategory);
router
    .route("/visaCategory/:visaCategoryId")
    .get((0, auth_1.auth)("Visas", permissions_1.Permission.READ), connectionResolver_1.connectionRequest, controllers_1.leadController.getVisaCategoryById)
    .patch((0, auth_1.auth)("Visas", permissions_1.Permission.UPDATE), connectionResolver_1.connectionRequest, controllers_1.leadController.updateVisaCategory)
    .delete((0, auth_1.auth)("Visas", permissions_1.Permission.DELETE), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteVisaCategoryById);
router
    .route("/")
    .get((0, auth_1.auth)("getLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getAllLeads)
    .post((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.createLead)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteAllLeads);
router
    .route("/:leadId")
    .get((0, auth_1.auth)("getLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getLeadById)
    .patch((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.updateLeadById)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteLeadById);
router
    .route("/:userId")
    .get((0, auth_1.auth)("getLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getSpecificLeads);
router
    .route("/leadAssignee")
    .get((0, auth_1.auth)("getLeadAssignes"), connectionResolver_1.connectionRequest, controllers_1.leadController.getAllAssignes)
    .post((0, auth_1.auth)("manageAssignes"), connectionResolver_1.connectionRequest, controllers_1.leadController.assignLead);
router
    .route("/leadAssignee/:leadId")
    .get((0, auth_1.auth)("getLeadAssignes"), connectionResolver_1.connectionRequest, controllers_1.leadController.getLeadAssigneeById);
router
    .route("/leadHistory/:leadId")
    .get((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getLeadHistory);
router
    .route("/importLeads")
    .post((0, auth_1.auth)("manageLeads"), multer_1.default.single("leadFile"), csvParser_1.parseFile, connectionResolver_1.connectionRequest, controllers_1.leadController.uploadLead);
router
    .route("/documentChecklist/:leadId")
    .get((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getLeadDocumentsZip)
    .post((0, auth_1.auth)("manageLeads"), multer_1.default.array("documents", 10), connectionResolver_1.connectionRequest, controllers_1.leadController.uploadLeadChecklists);
router
    .route("/getDocument/:leadId")
    .get((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getDocuments)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteDocuments);
router
    .route("/getSingleDocument/:leadId/:filename")
    .get((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getSingleDocuments)
    .patch((0, auth_1.auth)("manageLeads"), multer_1.default.single("documents"), connectionResolver_1.connectionRequest, controllers_1.leadController.updateSingleDocuments)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteSingleDocument);
router
    .route("/leadStatus/:leadId")
    .patch((0, auth_1.auth)("getLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.updateLeadStatus);
router
    .route("/leadNotes/:leadId")
    .get((0, auth_1.auth)("getLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.getNotes)
    .post((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.createLeadNote)
    .patch((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.updateLeadNote)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteAllNotes);
router
    .route("/leadNote/:noteId")
    .patch((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.updateLeadNote)
    .delete((0, auth_1.auth)("manageLeads"), connectionResolver_1.connectionRequest, controllers_1.leadController.deleteLeadNoteById);
exports.default = router;
