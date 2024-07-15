"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const services_1 = require("../services");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createLead = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const lead = await services_1.leadService.createLead(connection, req.body);
    const message = "Lead created successfully.";
    res.status(http_status_1.default.CREATED).json({ lead, message });
});
const getAllLeads = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leads = await services_1.leadService.getAllLeads(connection);
    res.status(http_status_1.default.OK).send(leads);
});
const getSpecificLeads = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const userId = req.params.userId;
    const leads = await services_1.leadService.getSpecificLeads(connection, userId);
    console.log(leads);
    res.status(http_status_1.default.OK).send(leads);
});
const deleteAllLeads = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    await services_1.leadService.deleteAllLeads(connection);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const getLeadById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const lead = await services_1.leadService.getLeadById(connection, leadId);
    if (lead) {
        res.status(http_status_1.default.OK).send(lead);
    }
    else {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Lead not found" });
    }
});
const updateLeadById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const updateData = req.body;
    const updatedLead = await services_1.leadService.updateLeadById(connection, leadId, updateData);
    if (updatedLead) {
        const message = "Lead updated successfully.";
        res.status(http_status_1.default.OK).json({ updatedLead, message });
    }
    else {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Lead not found" });
    }
});
const deleteLeadById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    if (leadDocuments !== undefined) {
        const folderPath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadId}`);
        if (fs_1.default.existsSync(folderPath)) {
            fs_1.default.rmSync(folderPath, { recursive: true });
        }
        await services_1.leadService.deleteDocuments(connection, leadId);
    }
    const deletedCount = await services_1.leadService.deleteLeadById(connection, leadId);
    if (deletedCount) {
        const message = "Lead deleted successfully.";
        res.status(http_status_1.default.NO_CONTENT).json({ message });
    }
    else {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Lead not found" });
    }
});
const updateLeadStatus = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadStatus = await services_1.leadService.updateLeadStatus(connection, leadId, req.body);
    res.status(http_status_1.default.OK).send(leadStatus);
});
const createVisaCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const visaCategory = await services_1.leadService.createVisaCategory(connection, req.body);
    const message = "Visa Category created successfully.";
    res.status(http_status_1.default.CREATED).json({ visaCategory, message });
});
const getVisaCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const visaCategory = await services_1.leadService.getAllVisaCategory(connection);
    res.status(http_status_1.default.OK).send(visaCategory);
});
const getVisaCategoryById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const visaCategoryId = req.params.visaCategoryId;
    const visaCategory = await services_1.leadService.getVisaCategoryById(connection, visaCategoryId);
    if (visaCategory) {
        res.status(http_status_1.default.OK).send(visaCategory);
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Visa category not found" });
    }
});
const updateVisaCategory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const visaCategoryId = req.params.visaCategoryId;
    const updateVisaCategoryData = req.body;
    const updatedVisaCategory = await services_1.leadService.updateVisaByCategory(connection, visaCategoryId, updateVisaCategoryData);
    if (updatedVisaCategory) {
        res.status(http_status_1.default.OK).send(updatedVisaCategory);
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Visa Category not found" });
    }
});
const deleteVisaCategoryById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const visaCategoryId = req.params.visaCategoryId;
    const deletedCount = await services_1.leadService.deleteVisaCategory(connection, visaCategoryId);
    if (deletedCount) {
        res.status(http_status_1.default.NO_CONTENT).send();
    }
    else {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "Visa Category not found" });
    }
});
const uploadLead = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const parsedData = req.body.parsedData;
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'No valid data to import');
    }
    const uploadLeads = await services_1.leadService.uploadLead(connection, parsedData, req.body.tenantID, req.body.userID);
    const message = "Leads uploaded successfully.";
    res.status(http_status_1.default.CREATED).json({ uploadLeads, message });
});
const getDocuments = (0, catchAsync_1.default)(async (req, res) => {
    const { leadId } = req.params;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    if (!leadDocuments) {
        return res.status(http_status_1.default.OK).json({ documents: [] });
    }
    res.status(http_status_1.default.OK).json(leadDocuments);
});
const getSingleDocuments = (0, catchAsync_1.default)(async (req, res) => {
    const { leadId, filename } = req.params;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    if (!leadDocuments || !leadDocuments.documents) {
        return res.status(404).json({ message: 'Lead documents not found' });
    }
    const document = leadDocuments.documents.find((doc) => doc.filename === filename);
    if (!document) {
        return res.status(404).json({ message: 'Document not found' });
    }
    const filePath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, filename);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    const readStream = fs_1.default.createReadStream(filePath);
    readStream.pipe(res);
});
const updateSingleDocuments = (0, catchAsync_1.default)(async (req, res) => {
    const { leadId, filename } = req.params;
    const { file } = req;
    if (!file) {
        return res.status(http_status_1.default.BAD_REQUEST).json({ message: 'No file uploaded' });
    }
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    const documentIndex = leadDocuments.documents.findIndex((doc) => doc.filename === filename);
    console.log("DocumentIndex:", documentIndex);
    if (documentIndex === -1) {
        return res.status(404).json({ message: 'Document not found' });
    }
    const oldFilePath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, filename);
    console.log("OldFilePath:", oldFilePath);
    if (fs_1.default.existsSync(oldFilePath)) {
        fs_1.default.unlinkSync(oldFilePath);
    }
    leadDocuments.documents[documentIndex] = {
        name: req.body.name,
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
    };
    await services_1.leadService.updateLeadDocuments(connection, leadId, leadDocuments);
    res.status(http_status_1.default.OK).json({ message: 'Document updated successfully', document: leadDocuments.documents[documentIndex] });
});
const deleteSingleDocument = (0, catchAsync_1.default)(async (req, res) => {
    const { leadId, filename } = req.params;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    if (!leadDocuments || !leadDocuments.documents) {
        return res.status(http_status_1.default.NOT_FOUND).json({ message: 'Lead document not found' });
    }
    const document = leadDocuments.documents.find((doc) => doc.filename === filename);
    if (!document) {
        return res.status(404).json({ message: 'Document not found' });
    }
    const filePath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, filename);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(http_status_1.default.NOT_FOUND).json({ message: 'File not found' });
    }
    fs_1.default.unlinkSync(filePath);
    const updatedDocuments = leadDocuments.documents.filter((doc) => doc.filename !== filename);
    if (updatedDocuments.length === 0) {
        await services_1.leadService.deleteDocuments(connection, leadId);
    }
    else {
        leadDocuments.documents = updatedDocuments;
        await services_1.leadService.updateLeadDocuments(connection, leadId, leadDocuments);
    }
    res.status(http_status_1.default.NO_CONTENT).send();
});
const deleteDocuments = (0, catchAsync_1.default)(async (req, res) => {
    const { leadId } = req.params;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, leadId);
    if (leadDocuments && leadDocuments.tenantID) {
        const folderPath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadId}`);
        if (fs_1.default.existsSync(folderPath)) {
            fs_1.default.rmSync(folderPath, { recursive: true });
        }
    }
    await services_1.leadService.deleteDocuments(connection, leadId);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const getLeadDocumentsZip = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadDocuments = await services_1.leadService.getLeadDocumentsById(connection, req.params.leadId);
    if (!leadDocuments || !leadDocuments.documents || leadDocuments.documents.length === 0) {
        return res.status(http_status_1.default.OK).json({ message: 'No documents uploaded yet' });
    }
    const archive = (0, archiver_1.default)('zip', {
        zlib: { level: 9 }
    });
    res.attachment('lead_documents.zip');
    archive.pipe(res);
    leadDocuments.documents.forEach((doc) => {
        const filePath = path_1.default.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, doc.filename);
        if (fs_1.default.existsSync(filePath)) {
            archive.file(filePath, { name: doc.originalname });
        }
    });
    await archive.finalize();
});
const uploadLeadChecklists = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const { leadID, tenantID, uploadType, documents: docNames } = req.body;
    const files = req.files;
    const documents = files.map((file, index) => ({
        name: docNames[index].name,
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
    }));
    const response = await services_1.leadService.uploadLeadDocuments(connection, documents, leadID, tenantID, uploadType);
    const message = "Leads Documents uploaded successfully.";
    res.status(http_status_1.default.CREATED).json({ message });
});
const getAllAssignes = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadAssignes = await services_1.leadService.getAllAssigne(connection);
    res.status(http_status_1.default.OK).send(leadAssignes);
});
const getLeadAssigneeById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const lead_id = req.params.leadId;
    const leadAssignes = await services_1.leadService.getAssigneById(connection, lead_id);
    res.status(http_status_1.default.OK).send(leadAssignes);
});
const assignLead = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const data = await services_1.leadService.assignLead(connection, req.body);
    res.status(http_status_1.default.CREATED).json({ assignLeadData: data.response, message: data.message });
});
const getLeadHistory = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadHitsory = await services_1.leadService.getLeadHistory(connection, leadId);
    res.status(http_status_1.default.OK).send(leadHitsory);
});
const createLeadNote = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadNoteData = {
        ...req.body,
        lead_id: leadId,
    };
    const leadNote = await services_1.leadService.createLeadNote(connection, leadNoteData);
    const message = "Lead Note created successfully.";
    res.status(http_status_1.default.CREATED).json({ leadNote, message });
});
const getNotes = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadNotes = await services_1.leadService.getLeadNotes(connection, leadId);
    res.status(http_status_1.default.OK).send(leadNotes);
});
const getAllLeadNotes = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    const leadNotes = await services_1.leadService.getLeadNotes(connection, leadId);
    res.status(http_status_1.default.OK).send(leadNotes);
});
const getNoteById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const noteId = req.params.noteId;
    const leadNote = await services_1.leadService.getLeadNoteById(connection, noteId);
    res.status(http_status_1.default.OK).send(leadNote);
});
const updateLeadNote = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const noteId = req.params.noteId;
    const updatedLeadNote = await services_1.leadService.updateLeadNoteById(connection, noteId, req.body);
    const message = "Lead Note updated successfully.";
    res.status(http_status_1.default.CREATED).json({ updatedLeadNote, message });
});
const deleteLeadNoteById = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const noteId = req.params.noteId;
    console.log("lead note id ", noteId);
    await services_1.leadService.deleteLeadNoteById(connection, noteId);
    res.status(http_status_1.default.NO_CONTENT).send();
});
const deleteAllNotes = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const leadId = req.params.leadId;
    await services_1.leadService.deleteAllLeadNotes(connection, leadId);
    res.status(http_status_1.default.NO_CONTENT).send();
});
exports.default = {
    createLead,
    getAllLeads,
    deleteAllLeads,
    getLeadById,
    updateLeadById,
    deleteLeadById,
    getSpecificLeads,
    updateLeadStatus,
    createVisaCategory,
    getVisaCategory,
    getVisaCategoryById,
    deleteVisaCategoryById,
    updateVisaCategory,
    uploadLead,
    getLeadDocumentsZip,
    getDocuments,
    getSingleDocuments,
    updateSingleDocuments,
    deleteDocuments,
    deleteSingleDocument,
    uploadLeadChecklists,
    getAllAssignes,
    assignLead,
    getLeadAssigneeById,
    getLeadHistory,
    createLeadNote,
    getAllLeadNotes,
    getNotes,
    getNoteById,
    updateLeadNote,
    deleteLeadNoteById,
    deleteAllNotes,
};
