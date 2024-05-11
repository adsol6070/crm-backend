import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";

interface Lead {
  id?: string;
  tenantID?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  qualification: string;
  visaInterest: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const createLead = async (connection: Knex, lead: Lead): Promise<Lead> => {
  const leadData = { ...lead };
  leadData.id = uuidv4();
  const [insertedLead] = await connection("leads")
    .insert(leadData)
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
  const updatedLead = await connection("leads")
    .where({ id: leadId })
    .update(updates)
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

export default {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
};
