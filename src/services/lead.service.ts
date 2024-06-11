import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import commonService from "./common.service";

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
  leadHistory?: { action: string; timestamp: string; }[];
  created_at?: string;
  updated_at?: string;
}

interface LeadAssignee {
  lead_id: string;
  user_id: string[];
  created_at?: string;
  updated_at?: string;
}

interface LeadNote {
  lead_id: string;
  user_id: string;
  note: string;
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

interface VisaCategory {
  id?: string;
  tenantID: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeadHistoryEntry {
  action: string;
  timestamp: string;
  details?: {
    createdBy?: string;
    updatedBy?: string;
    assignedAgents?: string[];
  };
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
}

const createLead = async (connection: Knex, lead: Lead): Promise<Lead> => {
  // const leadEmail = await commonService.isEmailTaken(connection, "leads", lead.email)
  // if (leadEmail) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  // }
  const { userID, ...leadData } = lead;
  const passportExpiry = leadData.passportExpiry === '' ? null : leadData.passportExpiry;

  const leadHistoryEntry = {
    action: 'Created',
    timestamp: new Date().toISOString(),
    details: { createdBy: lead.userID }
  };

  const correctedData = {

    ...leadData,
    id: uuidv4(),
    passportExpiry: passportExpiry,
    leadHistory: JSON.stringify([leadHistoryEntry])
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
  const lead = await getLeadById(connection, leadId);
  // console.log("updated lead previous data", lead)
  if (!lead) {
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
  const passportExpiry = updates.passportExpiry === '' ? null : updates.passportExpiry

  let leadHistory: Array<{ action: string; timestamp: string; details?: any }> = [];
  if (lead.leadHistory) {
    if (typeof lead.leadHistory === 'string') {
      leadHistory = JSON.parse(lead.leadHistory);
    }
    else {
      leadHistory = lead.leadHistory;
    }
  }

  leadHistory.push({
    action: 'Updated',
    timestamp: new Date().toISOString(),
    details: { updatedBy: updates.userID }
  });

  const { userID, ...updatedData } = updates;

  const updatedDataWithoutID = {
    ...updatedData,
    passportExpiry: passportExpiry,
    leadHistory: JSON.stringify(leadHistory)
  };

  const updatedLead = await connection("leads")
    .where({ id: leadId })
    .update(updatedDataWithoutID)
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
  const leadsWithIdsAndHistory = leads.map(lead => {
    const { userID, ...restOfLead } = lead;
    const leadHistoryEntry = {
      action: 'Created',
      timestamp: new Date().toISOString(),
      details: { createdBy: lead.userID }
    };

    return {
      ...restOfLead,
      id: uuidv4(),
      tenantID: tenantId,
      leadHistory: JSON.stringify([leadHistoryEntry])
    };
  });

  const insertedLeads = await connection("leads")
    .insert(leadsWithIdsAndHistory)
    .returning("*");

  return insertedLeads;
};

const getLeadDocumentsById = async (connection: Knex, leadID: string): Promise<any> => {
  const leadDocument = await connection("document_checklists").where({ leadID }).first();
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

const getAllAssigne = async (connection: Knex): Promise<LeadAssignee[]> => {
  return await connection("lead_assignees").select("*");
};

const getAssigneById = async (connection: Knex, lead_id: string): Promise<LeadAssignee> => {
  return await connection("lead_assignees").where({ lead_id }).first();
};

const assignLead = async (connection: Knex, leadAssignee: LeadAssignee): Promise<any> => {
  const { lead_id, user_id } = leadAssignee;

  if (!lead_id || !Array.isArray(user_id)) {
    throw new Error("Invalid Inputs");
  }

  const getAssignees = await getAssigneById(connection, lead_id);
  const lead = await getLeadById(connection, lead_id);

  let finalUserIds;
  let actionMessage;
  if (getAssignees) {
    if (user_id.length === 0) {
      await connection("lead_assignees").where({ lead_id }).delete();
      actionMessage = "Lead unassigned successfully";
    } else {
      const existingUserIds = new Set(getAssignees.user_id);
      const userIdsToAdd = user_id.filter(id => !existingUserIds.has(id));
      const userIdsToRemove = user_id.filter(id => existingUserIds.has(id));

      if (userIdsToAdd.length > 0) {
        finalUserIds = Array.from(new Set([...getAssignees.user_id, ...userIdsToAdd]));
      } else {
        finalUserIds = getAssignees.user_id.filter(id => !userIdsToRemove.includes(id));
      }

      if (finalUserIds.length === 0) {
        await connection("lead_assignees").where({ lead_id }).delete();
        actionMessage = "Lead unassigned successfully";
      } else {
        await connection("lead_assignees")
          .where({ lead_id })
          .update({ user_id: finalUserIds })
          .returning("*");
        actionMessage = "Lead updated successfully";
      }
    }
  } else {
    await connection("lead_assignees")
      .insert(leadAssignee)
      .returning("*");
    actionMessage = "Lead assigned successfully";
  }

  let leadHistory: Array<{ action: string; timestamp: string; details?: any }> = [];
  if (lead.leadHistory) {
    if (typeof lead.leadHistory === 'string') {
      leadHistory = JSON.parse(lead.leadHistory);
    } else {
      leadHistory = lead.leadHistory;
    }
  }

  leadHistory.push({
    action: actionMessage,
    timestamp: new Date().toISOString(),
    details: { assignedAgents: user_id }
  });

  await connection("leads")
    .where({ id: lead_id })
    .update({ leadHistory: JSON.stringify(leadHistory) });

  return { message: actionMessage };
};

const getLeadHistory = async (connection: Knex, leadId: string)/* Promise<{ leadHistory: LeadHistoryEntry[] }> */ => {
  const lead = await connection("leads").select("leadHistory").where({ id: leadId }).first();
  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead not found");
  }

  let leadHistory: LeadHistoryEntry[] = lead.leadHistory || [];


  const userIds = leadHistory
    .flatMap(entry => {
      const idsHashMap = new Map<string, any>();
      if (entry.details?.createdBy) idsHashMap.set("createdBy", entry.details?.createdBy);
      if (entry.details?.updatedBy) idsHashMap.set("updatedBy", entry.details?.updatedBy);
      if (entry.details?.assignedAgents) idsHashMap.set("assignedAgents", [...entry.details?.assignedAgents]);
      return idsHashMap;
    })
    .filter(Boolean);
  console.log(userIds)

  const users: User[] = await connection("users")
    .select("id", "firstname", "lastname");

  console.log("Users:", users);

  const userLookup = users.reduce((acc: any, user: any) => {
    acc[user.id] = user;
    return acc;
  }, {});

  console.log("UserLookup:", userLookup);

  const replaceIdsWithUsers = (hashMap: any) => {
    const newHashMap = new Map();
    for (const [key, value] of hashMap) {
      if (Array.isArray(value)) {
        newHashMap.set(key, value.map(id => userLookup[id] || id))
      } else {
        newHashMap.set(key, userLookup[value] || value)
      }
    }
    return newHashMap
  }

  const updatedHashMap = userIds.map((userId) => {
    return replaceIdsWithUsers(userId)
  })

  const fullLeadHistory = updatedHashMap.map(map => {
    const obj: any = {};
    for (const [key, value] of map) {
      obj[key] = value;
    }
    return obj;
  });

  console.log("UpdatedHashMap:", fullLeadHistory);

  return { fullLeadHistory };
};

const createLeadNote = async (connection: Knex, leadNote: LeadNote): Promise<LeadNote> => {

  const correctedData = {
    ...leadNote,
    id: uuidv4(),
  }

  console.log("lead note data", correctedData)
  const [insertedLeadNote] = await connection("lead_notes")
    .insert(correctedData)
    .returning("*");
  return insertedLeadNote;
};

const getLeadNotes = async (connection: Knex, leadId: string): Promise<any> => {
 
  const leadNotes = await connection("lead_notes").where({ lead_id: leadId }).select("*");

  const updatedData = await Promise.all(
    leadNotes.map(async ({ user_id, ...rest }) => {
      const noteUser = await connection("users").where({ id: user_id }).first();
      return {
        ...rest,
        user: noteUser
      };
    })
  );

  return updatedData;
};

const getLeadNoteById = async (connection: Knex, noteId: string): Promise<LeadNote[]> => {
  return await connection("lead_notes").where({ id: noteId }).first();
};

const updateLeadNoteById = async (
  connection: Knex,
  noteId: string,
  updateLeadNoteData: Partial<VisaCategory>,
): Promise<LeadNote> => {
  const updateLeadNote = await connection("lead_notes")
    .where({ id: noteId })
    .update(updateLeadNoteData)
    .returning("*");
  if (updateLeadNote.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Lead note not found after update",
    );
  }
  return updateLeadNote[0];
};

const deleteLeadNoteById = async (
  connection: Knex,
  noteId: string,
): Promise<number> => {

  const deletedCount = await connection("lead_notes").where({ id: noteId }).delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No lead note found to delete");
  }
  return deletedCount;
};

const deleteAllLeadNotes = async (connection: Knex, leadId: string): Promise<number> => {
  const leadNotes = await getLeadNotes(connection, leadId);
  if (leadNotes.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No lead notes found to delete');
  }
  const deletedCount = await connection('lead_notes').where({ lead_id: leadId }).delete();

  return deletedCount;
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
  getAllAssigne,
  assignLead,
  getAssigneById,
  getLeadHistory,
  createLeadNote,
  getLeadNotes,
  updateLeadNoteById,
  deleteLeadNoteById,
  deleteAllLeadNotes,
  getLeadNoteById,
};
