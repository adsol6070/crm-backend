import httpStatus from "http-status";
import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../utils/ApiError";

interface Data {
    tenantID: string,
    visaType: string,
    checklist: string,
}

const createChecklist = async (connection: Knex, data: Data, tenantID?: string): Promise<Data> => {
    const correctedData = {
        ...data,
        tenantID,
        id: uuidv4()
    }
    const [insertedData] = await connection("visa_checklists")
        .insert(correctedData)
        .returning("*");
    return insertedData;
};

const getChecklists = async (connection: Knex): Promise<Data[]> => {
    return await connection("visa_checklists").select("*").orderBy("created_at", "asc");
};

const deleteChecklistById = async (
    connection: Knex,
    checklistId: string,
): Promise<number> => {
    const deletedCount = await connection("visa_checklists").where({ id: checklistId }).delete();

    if (deletedCount === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "No checklist found to delete");
    }
    return deletedCount;
};

const getChecklistsByVisaType = async (connection: Knex, visaType: string): Promise<Data[]> => {
    const checklist = await connection("visa_checklists").where({ visaType: visaType }).first();
    // if (!checklist) {
    //     throw new ApiError(httpStatus.NOT_FOUND, "Checklist not found");
    // }
    return checklist;
};

const updatedChecklistsById = async (connection: Knex, checklistId: string, updatedChecklists: string) => {
    const checklist = await connection("visa_checklists").where({ id: checklistId }).first();
    if (!checklist) {
        throw new ApiError(httpStatus.NOT_FOUND, "Checklist not found");
    }
    console.log("ChecklistId ", checklistId)
    console.log("Updated Checklist ", updatedChecklists)
    const updatedData = await connection("visa_checklists")
    .where({ id: checklistId })
    .update({ checklist: updatedChecklists });
    
    return updatedData;
};

export default {
    createChecklist,
    getChecklists,
    deleteChecklistById,
    getChecklistsByVisaType,
    updatedChecklistsById
};
