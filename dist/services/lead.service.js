"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const __1 = require("..");
const capitalizeFirstLetterOfEachWord = (str) => {
    return str?.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
};
const createLead = async (connection, lead) => {
    // const leadEmail = await commonService.isEmailTaken(connection, "leads", lead.email)
    // if (leadEmail) {
    //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    // }
    const { ...leadData } = lead;
    const passportExpiry = leadData.passportExpiry === '' ? null : leadData.passportExpiry;
    const leadHistoryEntry = {
        action: "Created",
        timestamp: new Date().toISOString(),
        details: { createdBy: lead.userID },
    };
    const correctedData = {
        ...leadData,
        id: (0, uuid_1.v4)(),
        visaCategory: String(leadData.visaCategory).toLowerCase(),
        passportExpiry: passportExpiry,
        leadHistory: JSON.stringify([leadHistoryEntry]),
    };
    const [insertedLead] = await connection("leads")
        .insert(correctedData)
        .returning("*");
    return insertedLead;
};
const getAllLeads = async (connection) => {
    return await connection("leads").select("*").orderBy("created_at", "asc");
};
const deleteAllLeads = async (connection) => {
    const deletedCount = await connection("leads").select("*").delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No leads found to delete");
    }
    return deletedCount;
};
const getSpecificLeads = async (connection, userId) => {
    return await connection('leads')
        .leftJoin('lead_assignees', 'leads.id', 'lead_assignees.lead_id')
        .select('leads.*')
        .whereRaw('lead_assignees.user_id @> ?', [`{"${userId}"}`])
        .orWhereRaw(`"leadHistory" @> ?`, [JSON.stringify([{ details: { createdBy: userId } }])])
        .orderBy('leads.created_at', 'asc')
        .distinct('leads.id');
};
const getLeadById = async (connection, leadId) => {
    const lead = await connection("leads").where({ id: leadId }).first();
    if (!lead) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found");
    }
    return lead;
};
const updateLeadById = async (connection, leadId, updateBody) => {
    const lead = await getLeadById(connection, leadId);
    // console.log("updated lead previous data", lead)
    if (!lead) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found");
    }
    const updates = Object.entries(updateBody).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            const leadKey = key;
            acc[leadKey] = value;
        }
        return acc;
    }, {});
    const passportExpiry = updates.passportExpiry === "" ? null : updates.passportExpiry;
    let leadHistory = [];
    if (lead.leadHistory) {
        if (typeof lead.leadHistory === "string") {
            leadHistory = JSON.parse(lead.leadHistory);
        }
        else {
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
        leadHistory: JSON.stringify(leadHistory)
    };
    const updatedLead = await connection("leads")
        .where({ id: leadId })
        .update(updatedDataWithoutID)
        .returning("*");
    if (updatedLead.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found after update");
    }
    return updatedLead[0];
};
const deleteLeadById = async (connection, leadId) => {
    const deletedCount = await connection("leads").where({ id: leadId }).delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No lead found to delete");
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
const updateLeadStatus = async (connection, leadId, updateBody) => {
    const lead = await getLeadById(connection, leadId);
    if (!lead) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found");
    }
    let leadHistory = [];
    if (lead.leadHistory) {
        if (typeof lead.leadHistory === 'string') {
            leadHistory = JSON.parse(lead.leadHistory);
        }
        else {
            leadHistory = lead.leadHistory;
        }
    }
    // Capture previous and upcoming status
    const previousStatus = lead.leadStatus;
    const upcomingStatus = updateBody.leadStatus;
    // Add history entry
    leadHistory.push({
        action: 'Status Updated',
        timestamp: new Date().toISOString(),
        details: {
            statusUpdatedBy: updateBody.userID,
            previousStatus: previousStatus,
            upcomingStatus: upcomingStatus
        }
    });
    // Create updated data object
    const { ...updatedData } = updateBody;
    const updatedDataWithoutID = {
        ...updatedData,
        leadHistory: JSON.stringify(leadHistory)
    };
    // Update the lead in the database
    const updatedLead = await connection("leads")
        .where({ id: leadId })
        .update(updatedDataWithoutID)
        .returning("*");
    if (updatedLead.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found after update");
    }
    return updatedLead[0];
};
const createVisaCategory = async (connection, visaCategory) => {
    const updatedVisaCategory = {
        ...visaCategory,
        id: (0, uuid_1.v4)(),
        category: visaCategory.category.toLowerCase()
    };
    const [insertedVisaCategory] = await connection("visaCategory")
        .insert(updatedVisaCategory)
        .returning("*");
    return insertedVisaCategory;
};
const getAllVisaCategory = async (connection) => {
    return await connection("visaCategory").select("*");
};
const getVisaCategoryById = async (connection, visaCategoryId) => {
    const visa = await connection("visaCategory")
        .where({ id: visaCategoryId })
        .first();
    if (!visa) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Visa Category not found");
    }
    return visa;
};
const updateVisaByCategory = async (connection, visaCategoryId, updateVisaCategoryData) => {
    const updatedVisaCategory = await connection("visaCategory")
        .where({ id: visaCategoryId })
        .update(updateVisaCategoryData)
        .returning("*");
    if (updatedVisaCategory.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Visa Category not found after update");
    }
    return updatedVisaCategory[0];
};
const deleteVisaCategory = async (connection, visaCategoryId) => {
    const deletedCount = await connection("visaCategory")
        .where({ id: visaCategoryId })
        .delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No visa category found to delete");
    }
    return deletedCount;
};
const uploadLead = async (connection, leads, tenantId, userID) => {
    const leadsWithIdsAndHistory = leads.map(lead => {
        const { ...restOfLead } = lead;
        const passportExpiry = restOfLead.passportExpiry === '' ? null : restOfLead.passportExpiry;
        const leadHistoryEntry = {
            action: "Created",
            timestamp: new Date().toISOString(),
            details: { createdBy: userID },
        };
        return {
            ...restOfLead,
            id: (0, uuid_1.v4)(),
            tenantID: tenantId,
            country: capitalizeFirstLetterOfEachWord(restOfLead.country),
            state: capitalizeFirstLetterOfEachWord(restOfLead.state),
            district: capitalizeFirstLetterOfEachWord(restOfLead.district),
            city: capitalizeFirstLetterOfEachWord(restOfLead.city),
            passportExpiry: passportExpiry,
            userID: userID,
            visaCategory: String(restOfLead.visaCategory).toLowerCase(),
            leadHistory: JSON.stringify([leadHistoryEntry])
        };
    });
    const insertedLeads = await connection("leads")
        .insert(leadsWithIdsAndHistory)
        .returning("*");
    return insertedLeads;
};
const getLeadDocumentsById = async (connection, leadID) => {
    const leadDocument = await connection("document_checklists")
        .where({ leadID })
        .first();
    return leadDocument;
};
const deleteDocuments = async (connection, leadId) => {
    const deletedCount = await connection("document_checklists")
        .where({ leadID: leadId })
        .delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No documents found to delete");
    }
    return deletedCount;
};
const updateLeadDocuments = async (connection, leadId, leadDocuments) => {
    await connection("document_checklists")
        .where({ leadID: leadId })
        .update({ documents: JSON.stringify(leadDocuments.documents) });
};
const uploadLeadDocuments = async (connection, documents, leadID, tenantID, uploadType) => {
    const existingRecord = await connection("document_checklists")
        .where({ tenantID, leadID, uploadType })
        .first();
    if (existingRecord) {
        let existingDocuments;
        try {
            existingDocuments = existingRecord.documents;
        }
        catch (error) {
            console.error("Failed to parse existing documents JSON:", error);
            throw new Error("Failed to parse existing documents.");
        }
        const newDocuments = documents.filter((newDoc) => !existingDocuments.some((existingDoc) => existingDoc.name === newDoc.name));
        const mergedDocuments = [...existingDocuments, ...newDocuments];
        try {
            await connection("document_checklists")
                .where({ tenantID, leadID, uploadType })
                .update({ documents: JSON.stringify(mergedDocuments) });
        }
        catch (error) {
            console.error("Failed to update documents:", error);
            throw new Error("Failed to update documents.");
        }
    }
    else {
        const documentRecord = {
            id: (0, uuid_1.v4)(),
            tenantID,
            leadID,
            documents: JSON.stringify(documents),
            uploadType,
        };
        try {
            await connection("document_checklists").insert(documentRecord);
        }
        catch (error) {
            console.error("Failed to insert new document record:", error);
            throw new Error("Failed to insert new document record.");
        }
    }
};
const getAllAssigne = async (connection) => {
    return await connection("lead_assignees").select("*");
};
const getAssigneById = async (connection, lead_id) => {
    return await connection("lead_assignees").where({ lead_id }).first();
};
const assignLead = async (connection, leadAssignee) => {
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
            notificationMessages = getAssignees.user_id.map(id => ({
                user_id: id,
                message: `You have been unassigned to Lead ID: ${lead.firstname}`,
            }));
        }
        else {
            const existingUserIds = new Set(getAssignees.user_id);
            const userIdsToAdd = user_id.filter((id) => !existingUserIds.has(id));
            const userIdsToRemove = getAssignees.user_id.filter((id) => !user_id.includes(id));
            if (userIdsToAdd.length > 0) {
                finalUserIds = Array.from(new Set([...getAssignees.user_id, ...userIdsToAdd]));
                notificationMessages.push(...userIdsToAdd.map(id => ({
                    user_id: id,
                    message: `You have been assigned to Lead ID: ${lead.firstname}`
                })));
            }
            else {
                finalUserIds = getAssignees.user_id.filter(id => !userIdsToRemove.includes(id));
            }
            if (userIdsToRemove.length > 0) {
                notificationMessages.push(...userIdsToRemove.map(id => ({
                    user_id: id,
                    message: `You have been unassigned to Lead: ${lead.firstname}`
                })));
            }
            if (finalUserIds.length === 0) {
                await connection("lead_assignees").where({ lead_id }).delete();
                actionMessage = "Lead unassigned successfully";
            }
            else {
                await connection("lead_assignees")
                    .where({ lead_id })
                    .update({ user_id: finalUserIds })
                    .returning("*");
                actionMessage = "Lead updated successfully";
            }
        }
    }
    else {
        await connection("lead_assignees").insert(leadAssignee).returning("*");
        actionMessage = "Lead assigned successfully";
        notificationMessages = user_id.map(id => ({
            user_id: id,
            message: `You have been assigned to Lead: ${lead.firstname}`,
        }));
    }
    let leadHistory = [];
    if (lead.leadHistory) {
        if (typeof lead.leadHistory === "string") {
            leadHistory = JSON.parse(lead.leadHistory);
        }
        else {
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
        id: (0, uuid_1.v4)(),
        user_id,
        lead_id,
        message,
        icon: 'ri-user-add-line',
        variant: 'info',
    }));
    await connection("lead_notifications").insert(notifications);
    notificationMessages.forEach(({ user_id, message }) => {
        __1.io.to(`${user_id}`).emit('notification', {
            id: (0, uuid_1.v4)(),
            message,
            icon: 'ri-user-add-line',
            variant: 'info',
            created_at: new Date(),
        });
    });
    return { message: actionMessage };
};
const getLeadHistory = async (connection, leadId) => {
    const lead = await connection("leads")
        .select("leadHistory")
        .where({ id: leadId })
        .first();
    if (!lead) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead not found");
    }
    const users = await connection("users").select("id", "firstname", "lastname");
    const replaceUserIdsWithDocuments = (historyArray, usersTable) => {
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
                entry.details.assignedAgents = entry.details.assignedAgents.map((agentId) => userMap[agentId]);
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
const createLeadNote = async (connection, leadNote) => {
    const correctedData = {
        ...leadNote,
        id: (0, uuid_1.v4)(),
    };
    console.log("lead note data", correctedData);
    const [insertedLeadNote] = await connection("lead_notes")
        .insert(correctedData)
        .returning("*");
    return insertedLeadNote;
};
const getLeadNotes = async (connection, leadId) => {
    const leadNotes = await connection("lead_notes").where({ lead_id: leadId }).select("*").orderBy("created_at", "desc");
    const updatedData = await Promise.all(leadNotes.map(async ({ user_id, ...rest }) => {
        const noteUser = await connection("users").where({ id: user_id }).first();
        return {
            ...rest,
            user: noteUser,
        };
    }));
    return updatedData;
};
const getLeadNoteById = async (connection, noteId) => {
    return await connection("lead_notes").where({ id: noteId }).first();
};
const updateLeadNoteById = async (connection, noteId, updateLeadNoteData) => {
    const updateLeadNote = await connection("lead_notes")
        .where({ id: noteId })
        .update(updateLeadNoteData)
        .returning("*");
    if (updateLeadNote.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Lead note not found after update");
    }
    return updateLeadNote[0];
};
const deleteLeadNoteById = async (connection, noteId) => {
    const deletedCount = await connection("lead_notes")
        .where({ id: noteId })
        .delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No lead note found to delete");
    }
    return deletedCount;
};
const deleteAllLeadNotes = async (connection, leadId) => {
    const leadNotes = await getLeadNotes(connection, leadId);
    if (leadNotes.length === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No lead notes found to delete");
    }
    const deletedCount = await connection("lead_notes")
        .where({ lead_id: leadId })
        .delete();
    return deletedCount;
};
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
