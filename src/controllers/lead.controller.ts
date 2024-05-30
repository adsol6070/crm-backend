import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, leadService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import archiver from "archiver";
import path from 'path';
import fs from 'fs';

interface Lead {
  id: string;
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

const createLead = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const lead = await leadService.createLead(connection, req.body);
  const message = "Lead created successfully.";
  res.status(httpStatus.CREATED).json({ lead, message });
});

const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leads = await leadService.getAllLeads(connection);
  res.status(httpStatus.OK).send(leads);
});

const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;
  const lead = await leadService.getLeadById(connection, leadId);
  if (lead) {
    res.status(httpStatus.OK).send(lead);
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Lead not found" });
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
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Lead not found" });
  }
});

const deleteLeadById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadId = req.params.leadId;

  const leadDocuments = await leadService.getLeadDocumentsById(connection, leadId);

  if (leadDocuments && leadDocuments.tenantID) {
    const folderPath = path.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadId}`);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
  }

  await leadService.deleteDocuments(connection, leadId);

  const deletedCount = await leadService.deleteLeadById(connection, leadId);
  if (deletedCount) {
    const message = "Lead deleted successfully.";
    res.status(httpStatus.NO_CONTENT).json({ message });
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Lead not found" });
  }
});

const createVisaCategory = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategory = await leadService.createVisaCategory(
    connection,
    req.body,
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
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Visa category not found" });
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
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Visa Category not found" });
  }
});

const deleteVisaCategoryById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const visaCategoryId = req.params.visaCategoryId;
  const deletedCount = await leadService.deleteVisaCategory(
    connection,
    visaCategoryId,
  );
  if (deletedCount) {
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Visa Category not found" });
  }
});

const uploadLead = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const parsedData: Lead[] = req.body.parsedData as Lead[];
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No valid data to import');
  }
  const uploadLeads = await leadService.uploadLead(connection, parsedData, req.body.tenantID);
  const message = "Leads uploaded successfully.";
  res.status(httpStatus.CREATED).json({ uploadLeads, message });
});

const getDocuments = catchAsync(async (req: Request, res: Response) => {
  const { leadId } = req.params;
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(connection, leadId);

  if (!leadDocuments) {
    return res.status(httpStatus.OK).json({ documents: [] });
  }

  res.status(httpStatus.OK).json(leadDocuments);
});

const getSingleDocuments = catchAsync(async (req: Request, res: Response) => {
  const { leadId, filename } = req.params;

  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(connection, leadId);

  if (!leadDocuments || !leadDocuments.documents) {
    return res.status(404).json({ message: 'Lead documents not found' });
  }

  const document = leadDocuments.documents.find((doc: any) => doc.filename === filename);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const filePath = path.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

const deleteSingleDocument = catchAsync(async (req: Request, res: Response) => {
  const { leadId, filename } = req.params;
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(connection, leadId);

  if (!leadDocuments || !leadDocuments.documents) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Lead document not found' });
  }

  const document = leadDocuments.documents.find((doc: any) => doc.filename === filename);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const filePath = path.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'File not found' });
  }

  fs.unlinkSync(filePath);

  const updatedDocuments = leadDocuments.documents.filter((doc: any) => doc.filename !== filename);

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

  const leadDocuments = await leadService.getLeadDocumentsById(connection, leadId);

  if (leadDocuments && leadDocuments.tenantID) {
    const folderPath = path.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadId}`);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true });
    }
  }

  await leadService.deleteDocuments(connection, leadId);

  res.status(httpStatus.NO_CONTENT).send();
});

const getLeadDocumentsZip = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadDocuments = await leadService.getLeadDocumentsById(connection, req.params.leadId);

  if (!leadDocuments || !leadDocuments.documents || leadDocuments.documents.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No documents uploaded yet' });
  }

  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  res.attachment('lead_documents.zip');
  archive.pipe(res);

  leadDocuments.documents.forEach((doc: any) => {
    const filePath = path.join(__dirname, "..", 'uploads', leadDocuments.tenantID, `leadDocuments-${leadDocuments.leadID}`, doc.filename)

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: doc.originalname })
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

  const response = await leadService.uploadLeadDocuments(connection, documents, leadID, tenantID, uploadType);
  const message = "Leads Documents uploaded successfully.";
  res.status(httpStatus.CREATED).json({ message });
});


export default {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
  createVisaCategory,
  getVisaCategory,
  getVisaCategoryById,
  deleteVisaCategoryById,
  updateVisaCategory,
  uploadLead,
  getLeadDocumentsZip,
  getDocuments,
  getSingleDocuments,
  deleteDocuments,
  deleteSingleDocument,
  uploadLeadChecklists,
};
