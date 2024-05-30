import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import commonService from "./common.service";

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
  institutionName?: string;
  graduationYear?: string;
  grade?: string;
  testType?: string;
  testScore?: string;
  countryOfInterest?: string;
  visaCategory?: string;
  courseOfInterest?: string;
  desiredFieldOfStudy?: string;
  preferredInstitutions?: string;
  intakeSession?: string;
  reasonForImmigration?: string;
  financialSupport?: string;
  sponsorDetails?: string;
  proofOfFunds?: string;
  scholarships?: string;
  resume?: string;
  recommendationLetter?: string;
  sop?: string;
  transcripts?: string;
  certificates?: string;
  passportCopy?: string;
  languageTestReport?: string;
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
// interface Document {
//   leadId: string;
//   tenantID: string;
//   created_at?: string;
//   updated_at?: string;
// }

interface Document {
  name?: string;
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

interface VisaCategory {
  id?: string;
  tenantID: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const createLead = async (connection: Knex, lead: Lead): Promise<Lead> => {
  // const leadEmail = await commonService.isEmailTaken(connection, "leads", lead.email)
  // if (leadEmail) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  // }
  const leadData = { ...lead };
  const passportExpiry = leadData.passportExpiry === '' ? null: leadData.passportExpiry
  const correctedData = {
    ...leadData,
    id: uuidv4(),
    passportExpiry: passportExpiry
  }
  console.log(correctedData)
  const [insertedLead] = await connection("leads")
    .insert(correctedData)
    .returning("*");
  return insertedLead;
};

const getAllLeads = async (connection: Knex): Promise<Lead[]> => {
  return await connection("leads").select("*");
};

const getLeadById = async (connection: Knex, leadId: string): Promise<Lead> => {
  const lead = await connection("leads").where({ id: leadId }).first();
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead not found");
  }
  return lead;
};

const updateLeadById = async (
  connection: Knex,
  leadId: string,
  updateBody: Partial<Lead>,
) => {
  const Lead = await getLeadById(connection, leadId);
  if (!Lead) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead not found");
  }

  const updates = Object.entries(updateBody).reduce<Partial<Lead>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        const leadKey: keyof Lead = key as keyof Lead;
        acc[leadKey] = value as any;
      }
      return acc;
    },
    {} as Partial<Lead>,
  );
  const passportExpiry = updates.passportExpiry === '' ? null: updates.passportExpiry
  const updatedData = {
    ...updates,
    passportExpiry: passportExpiry
  }
// console.log("lead service data ", updatedData)
  const updatedLead = await connection("leads")
    .where({ id: leadId })
    .update(updatedData)
    .returning("*");

  if (updatedLead.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead not found after update");
  }
  return updatedLead[0];
};

const deleteLeadById = async (
  connection: Knex,
  leadId: string,
): Promise<number> => {
  const deletedCount = await connection("leads").where({ id: leadId }).delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No lead found to delete");
  }
  return deletedCount;
};

const createVisaCategory = async (
  connection: Knex,
  visaCategory: VisaCategory,
): Promise<VisaCategory> => {
  const updatedVisaCategory = {
    ...visaCategory,
    id: uuidv4(),
  };
  const [insertedVisaCategory] = await connection("visaCategory")
    .insert(updatedVisaCategory)
    .returning("*");
  return insertedVisaCategory;
};

const getAllVisaCategory = async (
  connection: Knex,
): Promise<VisaCategory[]> => {
  return await connection("visaCategory").select("*");
};

const getVisaCategoryById = async (
  connection: Knex,
  visaCategoryId: string,
): Promise<VisaCategory> => {
  const visa = await connection("visaCategory")
    .where({ id: visaCategoryId })
    .first();
  if (!visa) {
    throw new ApiError(httpStatus.NOT_FOUND, "Visa Category not found");
  }
  return visa;
};

const updateVisaByCategory = async (
  connection: Knex,
  visaCategoryId: string,
  updateVisaCategoryData: Partial<VisaCategory>,
): Promise<VisaCategory> => {
  const updatedVisaCategory = await connection("visaCategory")
    .where({ id: visaCategoryId })
    .update(updateVisaCategoryData)
    .returning("*");
  if (updatedVisaCategory.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Visa Category not found after update",
    );
  }
  return updatedVisaCategory[0];
};

const deleteVisaCategory = async (
  connection: Knex,
  visaCategoryId: string,
): Promise<number> => {
  const deletedCount = await connection("visaCategory")
    .where({ id: visaCategoryId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No visa category found to delete",
    );
  }
  return deletedCount;
};

const uploadLead = async (connection: Knex, leads: Lead[], tenantId: string): Promise<Lead[]> => {
  const leadsWithIds = leads.map(lead => ({ ...lead, id: uuidv4(), tenantID: tenantId }));
  const insertedLeads = await connection("leads")
    .insert(leadsWithIds)
    .returning("*");
  return insertedLeads;
};

const getLeadDocumentsById = async (connection: Knex, leadID: string): Promise<any> => {
  const leadDocument = await connection("document_checklists").where({ leadID }).first();
  if (!leadDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead Documents not found");
  }
  return leadDocument;
};

const deleteDocuments = async (
  connection: Knex,
  leadId: string,
): Promise<number> => {
  
  const deletedCount = await connection("document_checklists").where({ leadID: leadId }).delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No documents found to delete");
  }
  return deletedCount;
};

const updateLeadDocuments = async (connection: Knex, leadId: string, leadDocuments: any) => {
  await connection('document_checklists')
    .where({ leadID: leadId })
    .update({ documents: JSON.stringify(leadDocuments.documents) });
};


const uploadLeadDocuments = async (connection: Knex, documents: Document[], leadID: string, tenantID: string, uploadType: string): Promise<void> => {
  const existingRecord = await connection("document_checklists")
    .where({ tenantID, leadID, uploadType })
    .first();

  if (existingRecord) {
    let existingDocuments: Document[];
    try {
      existingDocuments = existingRecord.documents;
    } catch (error) {
      console.error("Failed to parse existing documents JSON:", error);
      throw new Error("Failed to parse existing documents.");
    }

    const newDocuments = documents.filter(newDoc => 
      !existingDocuments.some(existingDoc => existingDoc.name === newDoc.name)
    );

    const mergedDocuments = [...existingDocuments, ...newDocuments];
    
    try {
      await connection("document_checklists")
        .where({ tenantID, leadID, uploadType })
        .update({ documents: JSON.stringify(mergedDocuments) });
    } catch (error) {
      console.error("Failed to update documents:", error);
      throw new Error("Failed to update documents.");
    }
  } else {
    const documentRecord = {
      id: uuidv4(),
      tenantID,
      leadID,
      documents: JSON.stringify(documents),
      uploadType
    };

    try {
      await connection("document_checklists").insert(documentRecord);
    } catch (error) {
      console.error("Failed to insert new document record:", error);
      throw new Error("Failed to insert new document record.");
    }
  }
};

export default {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
  createVisaCategory,
  getAllVisaCategory,
  getVisaCategoryById,
  updateVisaByCategory,
  deleteVisaCategory,
  uploadLead,
  getLeadDocumentsById,
  deleteDocuments,
  updateLeadDocuments,
  uploadLeadDocuments,
};
