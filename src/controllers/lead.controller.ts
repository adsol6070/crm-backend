import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, leadService } from "../services";
import { Request, Response } from "express";

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
  const deletedCount = await leadService.deleteLeadById(connection, leadId);
  if (deletedCount) {
    const message = "Lead deleted successfully.";
    res.status(httpStatus.NO_CONTENT).json({ message });
  } else {
    res.status(httpStatus.NOT_FOUND).send({ message: "Lead not found" });
  }
});

export default {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadById,
  deleteLeadById,
};
