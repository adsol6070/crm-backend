import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { checklistService, connectionService, userService } from "../services";
import { Request, Response } from "express";

const createChecklist = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const checklist = await checklistService.createChecklist(
        connection,
        req.body,
    );
    const message = "Checklist created successfully.";
    res.status(httpStatus.CREATED).json({ message, checklist });
});

const getChecklists = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const checklists = await checklistService.getChecklists(connection);
    res.status(httpStatus.OK).json({ checklists });
});

const deleteChecklistsById = catchAsync(async (req: Request, res: Response) => {
    const { checklistId } = req.params;
    const connection = await connectionService.getCurrentTenantKnex();
    const checklists = await checklistService.deleteChecklistById(connection, checklistId);
    res.status(httpStatus.NO_CONTENT).send();
});

const getChecklistByVisaType = catchAsync(async (req: Request, res: Response) => {
    const { visaType } = req.params;
    const connection = await connectionService.getCurrentTenantKnex();
    const checklists = await checklistService.getChecklistsByVisaType(connection, visaType);
    res.status(httpStatus.OK).json({ checklists });
});

const updateChecklistById = catchAsync(async (req: Request, res: Response) => {
    const { checklistId } = req.params;
    const updatedChecklistsData = req.body;
    const connection = await connectionService.getCurrentTenantKnex();
    const updatedChecklists = await checklistService.updatedChecklistsById(connection, checklistId, updatedChecklistsData.checklist);
    res.status(httpStatus.OK).json({ updatedChecklists });
});

export default {
    createChecklist,
    getChecklists,
    deleteChecklistsById,
    getChecklistByVisaType,
    updateChecklistById,
};
