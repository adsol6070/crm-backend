import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import commonService from "./common.service";
import { io } from "..";
import { Parser } from "json2csv";

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
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
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
  leadHistory?: { action: string; timestamp: string }[];
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

const capitalizeFirstLetterOfEachWord = (str: string | undefined) => {
  return str?.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
};

const createLead = async (
  connection: Knex,
  lead: Lead,
  user: any,
): Promise<Lead> => {
  // const leadEmail = await commonService.isEmailTaken(connection, "leads", lead.email)
  // if (leadEmail) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  // }
  const { ...leadData } = lead;
  const passportExpiry =
    leadData.passportExpiry === "" ? null : leadData.passportExpiry;
  const userID = leadData.userID === "By QR Code" ? null : leadData.userID;
  const leadHistoryEntry = {
    action: "Created",
    timestamp: new Date().toISOString(),
    details: { createdBy: lead.userID },
  };

  const correctedData = {
    ...leadData,
    id: uuidv4(),
    tenantID: user.tenantID,
    userID,
    visaCategory: String(leadData.visaCategory).toLowerCase(),
    leadSource: String(leadData.leadSource).toLowerCase(),
    passportExpiry: passportExpiry,
    leadHistory: JSON.stringify([leadHistoryEntry]),
  };

  const [insertedLead] = await connection("leads")
    .insert(correctedData)
    .returning("*");
  return insertedLead;
};

const getAllLeads = async (connection: Knex): Promise<Lead[]> => {
  return await connection("leads").select("*").orderBy("created_at", "asc");
};

const downloadCsv = async (connection: Knex, visaCategory: string) => {
  let query = connection("leads").select("*").orderBy("created_at", "asc");

  if (visaCategory != "All") {
    query = query.where("visaCategory", visaCategory); 
  }

  const leads = await query;
  const json2CsvParser = new Parser();
  const data = json2CsvParser.parse(leads)
  return data
};

const deleteAllLeads = async (connection: Knex) => {
  const deletedCount = await connection("leads").select("*").delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No leads found to delete");
  }
  return deletedCount;
};

const getLeadDocumentsByIds = async (connection: Knex, leadIds: string[]) => {
  return connection("document_checklists")
    .select("tenantID", "leadID")
    .whereIn("leadID", leadIds);
};

const deleteSelectedLeads = async (
  connection: Knex,
  leadIds: string[],
): Promise<number> => {
  const deletedCount = await connection("leads")
    .whereIn("id", leadIds)
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No leads found to delete");
  }
  return deletedCount;
};

const getSpecificLeads = async (
  connection: Knex,
  userId: string,
): Promise<Lead[]> => {
  return await connection("leads")
    .leftJoin("lead_assignees", "leads.id", "lead_assignees.lead_id")
    .select("leads.*")
    .whereRaw("lead_assignees.user_id @> ?", [`{"${userId}"}`])
    .orWhereRaw(`"leadHistory" @> ?`, [
      JSON.stringify([{ details: { createdBy: userId } }]),
    ])
    .orderBy("leads.created_at", "asc")
    .distinct("leads.id");
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
  const passportExpiry =
    updates.passportExpiry === "" ? null : updates.passportExpiry;

  let leadHistory: Array<{ action: string; timestamp: string; details?: any }> =
    [];
  if (lead.leadHistory) {
    if (typeof lead.leadHistory === "string") {
      leadHistory = JSON.parse(lead.leadHistory);
    } else {
      leadHistory = lead.leadHistory;
    }
  }

  leadHistory.push({
    action: "Updated",
    timestamp: new Date().toISOString(),
    details: { updatedBy: updates.userID },
  });

  const { ...updatedData } = updates;

  const updatedDataWithoutID = {
    ...updatedData,
    passportExpiry: passportExpiry,
    visaCategory: String(updatedData.visaCategory).toLowerCase(),
    leadHistory: JSON.stringify(leadHistory),
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

// const updateLeadStatus = async (
//   connection: Knex,
//   leadId: string,
//   updateBody: Partial<Lead>,
// ) => {
//   const lead = await getLeadById(connection, leadId);
//   if (!lead) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Lead status not found");
//   }

//   let leadHistory: Array<{ action: string; timestamp: string; details?: any }> = [];
//   if (lead.leadHistory) {
//     if (typeof lead.leadHistory === 'string') {
//       leadHistory = JSON.parse(lead.leadHistory);
//     }
//     else {
//       leadHistory = lead.leadHistory;
//     }
//   }

//   leadHistory.push({
//     action: 'Status Updated',
//     timestamp: new Date().toISOString(),
//     details: { statusUpdatedBy: updateBody.userID }
//   });

//   const { ...updatedData } = updateBody;

//   const updatedDataWithoutID = {
//     ...updatedData,
//     leadHistory: JSON.stringify(leadHistory)
//   };

//   const updatedLead = await connection("leads")
//     .where({ id: leadId })
//     .update(updatedDataWithoutID)
//     .returning("*");

//   if (updatedLead.length === 0) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Lead not found after update");
//   }
//   return updatedLead[0];
// };

const updateLeadStatus = async (
  connection: Knex,
  leadId: string,
  updateBody: Partial<Lead>,
) => {
  try {
    const lead = await getLeadById(connection, leadId);

    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, "Lead not found");
    }

    let leadHistory: Array<{
      action: string;
      timestamp: string;
      details?: any;
    }> = [];

    if (lead.leadHistory) {
      leadHistory =
        typeof lead.leadHistory === "string"
          ? JSON.parse(lead.leadHistory)
          : lead.leadHistory;
    }

    const previousStatus = lead.leadStatus;
    const upcomingStatus = updateBody.leadStatus;

    leadHistory.push({
      action: "Status Updated",
      timestamp: new Date().toISOString(),
      details: {
        statusUpdatedBy: updateBody.userID,
        previousStatus: previousStatus,
        upcomingStatus: upcomingStatus,
      },
    });

    const updatedData = {
      ...updateBody,
      leadHistory: JSON.stringify(leadHistory),
    };

    const updatedLead = await connection("leads")
      .where({ id: leadId })
      .update(updatedData)
      .returning("*");

    if (updatedLead.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Lead not found after update");
    }

    return updatedLead[0];
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating lead status",
    );
  }
};

const createVisaCategory = async (
  connection: Knex,
  visaCategory: VisaCategory,
  tenantID?: string,
): Promise<VisaCategory> => {
  const updatedVisaCategory = {
    ...visaCategory,
    tenantID,
    id: uuidv4(),
    category: visaCategory.category.toLowerCase(),
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

const deleteCategoryByIds = async (connection: Knex, categoryIds: string[]) => {
  if (categoryIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No category IDs provided");
  }

  const deletedCount = await connection("visaCategory")
    .whereIn("id", categoryIds)
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No category found to delete");
  }
};

const uploadLead = async (
  connection: Knex,
  leads: Lead[],
  tenantId: string,
  userID: string,
): Promise<Lead[]> => {
  const leadsWithIdsAndHistory = leads.map((lead) => {
    const { ...restOfLead } = lead;
    const passportExpiry =
      restOfLead.passportExpiry === "" ? null : restOfLead.passportExpiry;
    const userID = restOfLead.userID === "" ? null : restOfLead.userID;
    const leadHistoryEntry = {
      action: "Created",
      timestamp: new Date().toISOString(),
      details: { createdBy: userID },
    };
    const leadHistoryData = restOfLead.leadHistory == undefined ? JSON.stringify([leadHistoryEntry]) : restOfLead.leadHistory
    
    return {
      ...restOfLead,
      id: uuidv4(),
      tenantID: tenantId,
      country: capitalizeFirstLetterOfEachWord(restOfLead.country),
      state: capitalizeFirstLetterOfEachWord(restOfLead.state),
      district: capitalizeFirstLetterOfEachWord(restOfLead.district),
      city: capitalizeFirstLetterOfEachWord(restOfLead.city),
      passportExpiry: passportExpiry,
      userID: userID,
      visaCategory: String(restOfLead.visaCategory).toLowerCase(),
      leadHistory: leadHistoryData,
    };
  });

  const insertedLeads = await connection("leads")
    .insert(leadsWithIdsAndHistory)
    .returning("*");

  return insertedLeads;
};


const getLeadDocumentsById = async (
  connection: Knex,
  leadID: string,
): Promise<any> => {
  const leadDocument = await connection("document_checklists")
    .where({ leadID })
    .first();
  return leadDocument;
};

const deleteDocuments = async (
  connection: Knex,
  leadId: string,
): Promise<number> => {
  const deletedCount = await connection("document_checklists")
    .where({ leadID: leadId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No documents found to delete");
  }
  return deletedCount;
};

const updateLeadDocuments = async (
  connection: Knex,
  leadId: string,
  leadDocuments: any,
) => {
  await connection("document_checklists")
    .where({ leadID: leadId })
    .update({ documents: JSON.stringify(leadDocuments.documents) });
};

const uploadLeadDocuments = async (
  connection: Knex,
  documents: Document[],
  leadID: string,
  tenantID: string,
  uploadType: string,
): Promise<void> => {
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

    const newDocuments = documents.filter(
      (newDoc) =>
        !existingDocuments.some(
          (existingDoc) => existingDoc.name === newDoc.name,
        ),
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
      uploadType,
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

const getAssigneById = async (
  connection: Knex,
  lead_id: string,
): Promise<LeadAssignee> => {
  return await connection("lead_assignees").where({ lead_id }).first();
};

const getDocumentStatus = async (connection: Knex) => {
  const uploadedDocument = await connection("document_checklists").select("leadID", "documents");
  return uploadedDocument
};

const assignLead = async (
  connection: Knex,
  leadAssignee: LeadAssignee,
): Promise<any> => {
  const { lead_id, user_id } = leadAssignee;

  if (!lead_id || !Array.isArray(user_id)) {
    throw new Error("Invalid Inputs");
  }

  const getAssignees = await getAssigneById(connection, lead_id);
  const lead = await getLeadById(connection, lead_id);
  let finalUserIds;
  let actionMessage;
  let notificationMessages = [];

  if (getAssignees) {
    if (user_id.length === 0) {
      await connection("lead_assignees").where({ lead_id }).delete();
      actionMessage = "Lead unassigned successfully";
      notificationMessages = getAssignees.user_id.map((id) => ({
        user_id: id,
        message: `You have been unassigned to Lead ID: ${lead.firstname}`,
      }));
    } else {
      const existingUserIds = new Set(getAssignees.user_id);
      const userIdsToAdd = user_id.filter((id) => !existingUserIds.has(id));
      const userIdsToRemove = getAssignees.user_id.filter(
        (id) => !user_id.includes(id),
      );

      if (userIdsToAdd.length > 0) {
        finalUserIds = Array.from(
          new Set([...getAssignees.user_id, ...userIdsToAdd]),
        );
        notificationMessages.push(
          ...userIdsToAdd.map((id) => ({
            user_id: id,
            message: `You have been assigned to Lead ID: ${lead.firstname}`,
          })),
        );
      } else {
        finalUserIds = getAssignees.user_id.filter(
          (id) => !userIdsToRemove.includes(id),
        );
      }

      if (userIdsToRemove.length > 0) {
        notificationMessages.push(
          ...userIdsToRemove.map((id) => ({
            user_id: id,
            message: `You have been unassigned to Lead: ${lead.firstname}`,
          })),
        );
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
    await connection("lead_assignees").insert(leadAssignee).returning("*");
    actionMessage = "Lead assigned successfully";
    notificationMessages = user_id.map((id) => ({
      user_id: id,
      message: `You have been assigned to Lead: ${lead.firstname}`,
    }));
  }

  let leadHistory: Array<{ action: string; timestamp: string; details?: any }> =
    [];
  if (lead.leadHistory) {
    if (typeof lead.leadHistory === "string") {
      leadHistory = JSON.parse(lead.leadHistory);
    } else {
      leadHistory = lead.leadHistory;
    }
  }

  leadHistory.push({
    action: actionMessage,
    timestamp: new Date().toISOString(),
    details: { assignedAgents: user_id },
  });

  await connection("leads")
    .where({ id: lead_id })
    .update({ leadHistory: JSON.stringify(leadHistory) });

  const notifications = notificationMessages.map(({ user_id, message }) => ({
    id: uuidv4(),
    user_id,
    lead_id,
    message,
    icon: "ri-user-add-line",
    variant: "info",
  }));

  await connection("lead_notifications").insert(notifications);

  notificationMessages.forEach(({ user_id, message }) => {
    io.to(`${user_id}`).emit("notification", {
      id: uuidv4(),
      message,
      icon: "ri-user-add-line",
      variant: "info",
      created_at: new Date(),
    });
  });

  return { message: actionMessage };
};

const getLeadHistory = async (connection: Knex, leadId: string) => {
  const lead = await connection("leads")
    .select("leadHistory")
    .where({ id: leadId })
    .first();

  if (!lead) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lead not found");
  }

  const users: User[] = await connection("users").select(
    "id",
    "firstname",
    "lastname",
  );

  const replaceUserIdsWithDocuments = (
    historyArray: any[],
    usersTable: any[],
  ) => {
    const userMap = usersTable.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});

    const modifiedHistoryArray = historyArray?.map((entry) => {
      if (entry.details.createdBy) {
        entry.details.createdBy = userMap[entry.details.createdBy];
      }
      if (entry.details.updatedBy) {
        entry.details.updatedBy = userMap[entry.details.updatedBy];
      }
      if (entry.details.assignedAgents) {
        entry.details.assignedAgents = entry.details.assignedAgents.map(
          (agentId: string) => userMap[agentId],
        );
      }
      if (entry.details.statusUpdatedBy) {
        entry.details.statusUpdatedBy = userMap[entry.details.statusUpdatedBy];
      }

      return entry;
    });

    return modifiedHistoryArray;
  };

  const fullLeadHistory = replaceUserIdsWithDocuments(lead.leadHistory, users);

  return { fullLeadHistory };
};

const createLeadNote = async (
  connection: Knex,
  leadNote: LeadNote,
): Promise<LeadNote> => {
  const correctedData = {
    ...leadNote,
    id: uuidv4(),
  };

  console.log("lead note data", correctedData);
  const [insertedLeadNote] = await connection("lead_notes")
    .insert(correctedData)
    .returning("*");
  return insertedLeadNote;
};

const getLeadNotes = async (connection: Knex, leadId: string): Promise<any> => {
  const leadNotes = await connection("lead_notes")
    .where({ lead_id: leadId })
    .select("*")
    .orderBy("created_at", "desc");

  const updatedData = await Promise.all(
    leadNotes.map(async ({ user_id, ...rest }) => {
      const noteUser = await connection("users").where({ id: user_id }).first();
      return {
        ...rest,
        user: noteUser,
      };
    }),
  );

  return updatedData;
};

const getLeadNoteById = async (
  connection: Knex,
  noteId: string,
): Promise<LeadNote[]> => {
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
  const deletedCount = await connection("lead_notes")
    .where({ id: noteId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No lead note found to delete");
  }
  return deletedCount;
};

const deleteAllLeadNotes = async (
  connection: Knex,
  leadId: string,
): Promise<number> => {
  const leadNotes = await getLeadNotes(connection, leadId);
  if (leadNotes.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No lead notes found to delete");
  }
  const deletedCount = await connection("lead_notes")
    .where({ lead_id: leadId })
    .delete();

  return deletedCount;
};
const uploadSingleDocument = async (
  connection: Knex,
  document: Document,
  leadID: string,
  tenantID: string,
  uploadType: string,
): Promise<void> => {
  const existingRecord = await connection("document_checklists")
    .where({ tenantID, leadID, uploadType })
    .first();

  if (existingRecord) {
    let existingDocuments: Document[];
    try {
      existingDocuments = existingRecord.documents;
    } catch (error) {
      console.error("Failed to parse existing documents JSON:", error);
      existingDocuments = [];
    }

    const documentExists = existingDocuments.some(
      (existingDoc) => existingDoc.name === document.name,
    );

    if (!documentExists) {
      existingDocuments.push(document);

      try {
        await connection("document_checklists")
          .where({ tenantID, leadID, uploadType })
          .update({ documents: JSON.stringify(existingDocuments) });
      } catch (error) {
        console.error("Failed to update documents:", error);
        throw new Error("Failed to update documents.");
      }
    }
  } else {
    const documentRecord = {
      id: uuidv4(),
      tenantID,
      leadID,
      documents: JSON.stringify([document]),
      uploadType,
    };

    try {
      await connection("document_checklists").insert(documentRecord);
    } catch (error) {
      console.error("Failed to insert new document record:", error);
      throw new Error("Failed to insert new document record.");
    }
  }
};

const getAllLeadDocuments = async (connection: Knex) => {
  return connection("document_checklists").select("tenantID", "leadID");
};

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
  getAllVisaCategory,
  downloadCsv,
  getDocumentStatus,
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
  uploadSingleDocument,
  getAllLeadDocuments,
  getLeadDocumentsByIds,
  deleteSelectedLeads,
  deleteCategoryByIds,
};
