import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, leadService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import archiver from "archiver";
import path from "path";
import fs from "fs";

interface Lead {
  id: string;
  userID: string;
  tenantID: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  maritalStatus?: string;
  passportNumber?: string;
  passportExpiry?: string;
  currentAddress?: string;
  permanentAddress?: string;
  highestQualification?: string;
  fieldOfStudy?: string;
  visaCategory?: string;
  institutionName?: string;
  graduationYear?: string;
  grade?: string;
  testType?: string;
  testScore?: string;
  countryOfInterest?: string;
  courseOfInterest?: string;
  desiredFieldOfStudy?: string;
  preferredInstitutions?: string;
  intakeSession?: string;
  reasonForImmigration?: string;
  financialSupport?: string;
  sponsorDetails?: string;
  scholarships?: string;
  communicationMode?: string;
  preferredContactTime?: string;
  notes?: string;
  leadSource?: string;
  referralContact?: string;
  leadStatus?: string;
  assignedAgent?: string;
  followUpDates?: string;
  leadRating?: string;
  leadNotes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Document {
  name?: string;
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

const getDocumentUrl = (filename: string, tenantID: string, leadID: string) => {
  const baseUrl = "http://192.168.1.7:8000/uploads";
  return `${baseUrl}/${tenantID}/leadDocuments-${leadID}/${filename}`;
};

const createLead = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const lead = await leadService.createLead(connection, req.body, req.user);
  const message = "Lead created successfully.";
  res.status(httpStatus.CREATED).json({ lead, message });
});

const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leads = await leadService.getAllLeads(connection);
  res.status(httpStatus.OK).send(leads);
});

const getSpecificLeads = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const userId = req.params.userId;
  const leads = await leadService.getSpecificLeads(connection, userId);
  res.status(httpStatus.OK).send(leads);
});

const deleteAllLeads = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const allLeadDocuments = await leadService.getAllLeadDocuments(connection);

  for (const leadDocuments of allLeadDocuments) {
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadDocuments.leadID}`,
    );

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
    await leadService.deleteDocuments(connection, leadDocuments.leadID);
  }

  await leadService.deleteAllLeads(connection);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSelectedLeads = catchAsync(async (req: Request, res: Response) => {
  const { leadIds } = req.body;
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send("No lead IDs provided");
  }

  const connection = await connectionService.getCurrentTenantKnex();

  const allLeadDocuments = await leadService.getLeadDocumentsByIds(
    connection,
    leadIds,
  );

  for (const leadDocuments of allLeadDocuments) {
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadDocuments.leadID}`,
    );
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
    await leadService.deleteDocuments(connection, leadDocuments.leadID);
  }

  await leadService.deleteSelectedLeads(connection, leadIds);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateLeadsBulk = catchAsync(async (req: Request, res: Response) => {
  const { leadIds, leadStatus } = req.body;

  if (!Array.isArray(leadIds) || typeof leadStatus !== "string") {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Invalid input" });
  }

  if (leadIds.length === 0) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "No lead IDs provided" });
  }

  const connection = await connectionService.getCurrentTenantKnex();

  try {
    const updatedLeads = await Promise.all(
      leadIds.map(async (leadId) => {
        const data = {
          leadStatus,
          userID: req.user?.id,
        };
        return await leadService.updateLeadStatus(connection, leadId, data);
      }),
    );

    res
      .status(httpStatus.OK)
      .json({ updatedLeads, message: "Leads updated successfully." });
  } catch (error) {
    console.error("Error updating leads:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to update leads." });
  }
});

const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const lead = await leadService.getLeadById(connection, leadId);
  if (lead) {
    res.status(httpStatus.OK).send(lead);
  }
});

const updateLeadById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const updateData = req.body;
  const updatedLead = await leadService.updateLeadById(
    connection,
    leadId,
    updateData,
  );
  if (updatedLead) {
    const message = "Lead updated successfully.";
    res.status(httpStatus.OK).json({ updatedLead, message });
  }
});

const deleteLeadById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;

  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (leadDocuments !== undefined) {
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadId}`,
    );

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
    await leadService.deleteDocuments(connection, leadId);
  }

  const deletedCount = await leadService.deleteLeadById(connection, leadId);
  if (deletedCount) {
    const message = "Lead deleted successfully.";
    res.status(httpStatus.NO_CONTENT).json({ message });
  }
});

const updateLeadStatus = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const leadStatus = await leadService.updateLeadStatus(
    connection,
    leadId,
    req.body,
  );
  res.status(httpStatus.OK).send(leadStatus);
});

const createVisaCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategory = await leadService.createVisaCategory(
    connection,
    req.body,
    req.user?.tenantID,
  );
  const message = "Visa Category created successfully.";
  res.status(httpStatus.CREATED).json({ visaCategory, message });
});

const getVisaCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategory = await leadService.getAllVisaCategory(connection);
  res.status(httpStatus.OK).send(visaCategory);
});

const getVisaCategoryById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategoryId = req.params.visaCategoryId;
  const visaCategory = await leadService.getVisaCategoryById(
    connection,
    visaCategoryId,
  );
  if (visaCategory) {
    res.status(httpStatus.OK).send(visaCategory);
  }
});

const updateVisaCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategoryId = req.params.visaCategoryId;
  const updateVisaCategoryData = req.body;
  const updatedVisaCategory = await leadService.updateVisaByCategory(
    connection,
    visaCategoryId,
    updateVisaCategoryData,
  );
  if (updatedVisaCategory) {
    res.status(httpStatus.OK).send(updatedVisaCategory);
  }
});

const deleteVisaCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const visaCategoryId = req.params.visaCategoryId;
    const deletedCount = await leadService.deleteVisaCategory(
      connection,
      visaCategoryId,
    );
    if (deletedCount) {
      res.status(httpStatus.NO_CONTENT).send();
    }
  },
);

const deleteSelectedVisaCategories = catchAsync(async (req: Request, res: Response) => {
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send("No Category IDs provided");
  }

  const connection = await connectionService.getCurrentTenantKnex();
  const deletedCount = await leadService.deleteCategoryByIds(connection, categoryIds);
});

const uploadLead = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const parsedData: Lead[] = req.body.parsedData as Lead[];
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No valid data to import");
  }
  const uploadLeads = await leadService.uploadLead(
    connection,
    parsedData,
    req.body.tenantID,
    req.body.userID,
  );
  const message = "Leads uploaded successfully.";
  res.status(httpStatus.CREATED).json({ uploadLeads, message });
});

const getDocuments = catchAsync(async (req: Request, res: Response) => {
  const { leadId } = req.params;
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (!leadDocuments) {
    return res.status(httpStatus.OK).json({ documents: [] });
  }

  res.status(httpStatus.OK).json(leadDocuments);
});

const getSingleDocuments = catchAsync(async (req: Request, res: Response) => {
  const { leadId, filename } = req.params;

  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (!leadDocuments || !leadDocuments.documents) {
    return res.status(404).json({ message: "Lead documents not found" });
  }

  const document = leadDocuments.documents.find(
    (doc: any) => doc.filename === filename,
  );

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    leadDocuments.tenantID,
    `leadDocuments-${leadDocuments.leadID}`,
    filename,
  );
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

const updateSingleDocuments = catchAsync(
  async (req: Request, res: Response) => {
    const { leadId, filename } = req.params;
    const { file } = req;

    if (!file) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "No file uploaded" });
    }

    const connection = await connectionService.getCurrentTenantKnex();
    const leadDocuments = await leadService.getLeadDocumentsById(
      connection,
      leadId,
    );

    const documentIndex = leadDocuments.documents.findIndex(
      (doc: any) => doc.filename === filename,
    );

    if (documentIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const oldFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadDocuments.leadID}`,
      filename,
    );

    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    leadDocuments.documents[documentIndex] = {
      name: req.body.name,
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    };

    await leadService.updateLeadDocuments(connection, leadId, leadDocuments);

    res.status(httpStatus.OK).json({
      message: "Document updated successfully",
      document: leadDocuments.documents[documentIndex],
    });
  },
);

const deleteSingleDocument = catchAsync(async (req: Request, res: Response) => {
  const { leadId, filename } = req.params;
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (!leadDocuments || !leadDocuments.documents) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ message: "Lead document not found" });
  }

  const document = leadDocuments.documents.find(
    (doc: any) => doc.filename === filename,
  );

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    leadDocuments.tenantID,
    `leadDocuments-${leadDocuments.leadID}`,
    filename,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "File not found" });
  }

  fs.unlinkSync(filePath);

  const updatedDocuments = leadDocuments.documents.filter(
    (doc: any) => doc.filename !== filename,
  );

  if (updatedDocuments.length === 0) {
    await leadService.deleteDocuments(connection, leadId);
  } else {
    leadDocuments.documents = updatedDocuments;
    await leadService.updateLeadDocuments(connection, leadId, leadDocuments);
  }

  res.status(httpStatus.NO_CONTENT).send();
});

const deleteDocuments = catchAsync(async (req: Request, res: Response) => {
  const { leadId } = req.params;
  const connection = await connectionService.getCurrentTenantKnex();

  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (leadDocuments && leadDocuments.tenantID) {
    const folderPath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadId}`,
    );

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
  }

  await leadService.deleteDocuments(connection, leadId);

  res.status(httpStatus.NO_CONTENT).send();
});

const getLeadDocumentsZip = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    req.params.leadId,
  );

  if (
    !leadDocuments ||
    !leadDocuments.documents ||
    leadDocuments.documents.length === 0
  ) {
    return res
      .status(httpStatus.OK)
      .json({ message: "No documents uploaded yet" });
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  res.attachment("lead_documents.zip");
  archive.pipe(res);

  leadDocuments.documents.forEach((doc: any) => {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      leadDocuments.tenantID,
      `leadDocuments-${leadDocuments.leadID}`,
      doc.filename,
    );

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: doc.originalname });
    }
  });

  await archive.finalize();
});

const uploadLeadChecklists = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const { leadID, tenantID, uploadType, documents: docNames } = req.body;
  const files = req.files as Express.Multer.File[];

  const documents = files.map((file, index) => ({
    name: docNames[index].name,
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const response = await leadService.uploadLeadDocuments(
    connection,
    documents,
    leadID,
    tenantID,
    uploadType,
  );
  const message = "Leads Documents uploaded successfully.";
  res.status(httpStatus.CREATED).json({ message });
});

const getAllAssignes = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadAssignes = await leadService.getAllAssigne(connection);
  res.status(httpStatus.OK).send(leadAssignes);
});

const getLeadAssigneeById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const lead_id = req.params.leadId;
  const leadAssignes = await leadService.getAssigneById(connection, lead_id);
  res.status(httpStatus.OK).send(leadAssignes);
});

const assignLead = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const data = await leadService.assignLead(connection, req.body);
  res
    .status(httpStatus.CREATED)
    .json({ assignLeadData: data.response, message: data.message });
});

const getLeadHistory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const leadHitsory = await leadService.getLeadHistory(connection, leadId);
  res.status(httpStatus.OK).send(leadHitsory);
});

const createLeadNote = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const leadNoteData = {
    ...req.body,
    lead_id: leadId,
  };
  const leadNote = await leadService.createLeadNote(connection, leadNoteData);
  const message = "Lead Note created successfully.";
  res.status(httpStatus.CREATED).json({ leadNote, message });
});

const getNotes = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const leadNotes = await leadService.getLeadNotes(connection, leadId);
  res.status(httpStatus.OK).send(leadNotes);
});

const getAllLeadNotes = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const leadNotes = await leadService.getLeadNotes(connection, leadId);
  res.status(httpStatus.OK).send(leadNotes);
});

const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const noteId = req.params.noteId;
  const leadNote = await leadService.getLeadNoteById(connection, noteId);
  res.status(httpStatus.OK).send(leadNote);
});

const updateLeadNote = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const noteId = req.params.noteId;
  const updatedLeadNote = await leadService.updateLeadNoteById(
    connection,
    noteId,
    req.body,
  );
  const message = "Lead Note updated successfully.";
  res.status(httpStatus.CREATED).json({ updatedLeadNote, message });
});

const deleteLeadNoteById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const noteId = req.params.noteId;
  await leadService.deleteLeadNoteById(connection, noteId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteAllNotes = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  await leadService.deleteAllLeadNotes(connection, leadId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSingleDocumentURL = catchAsync(async (req, res) => {
  const { leadId, filename } = req.params;

  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(
    connection,
    leadId,
  );

  if (!leadDocuments || !leadDocuments.documents) {
    return res.status(404).json({ message: "Lead documents not found" });
  }

  const document = leadDocuments.documents.find(
    (doc: any) => doc.filename === filename,
  );

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    leadDocuments.tenantID,
    `leadDocuments-${leadDocuments.leadID}`,
    filename,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  // Generate URL instead of streaming the file
  const documentUrl = getDocumentUrl(
    filename,
    leadDocuments.tenantID,
    leadDocuments.leadID,
  );

  return res.status(200).json({ url: documentUrl });
});

const uploadSingleDocument = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const { tenantID, leadID, name, uploadType } = req.body;
  const file: Document = req.file as Express.Multer.File;

  const document = {
    name: name,
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  };

  const response = await leadService.uploadSingleDocument(
    connection,
    document,
    leadID,
    tenantID,
    uploadType,
  );
  const message = "Lead Document uploaded successfully.";
  res.status(httpStatus.CREATED).json({ message });
});

export default {
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
  getSingleDocumentURL,
  uploadSingleDocument,
  deleteSelectedLeads,
  updateLeadsBulk,
  deleteSelectedVisaCategories,
};
