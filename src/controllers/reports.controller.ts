import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, reportService } from "../services";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";

const getLeadsBasedonStatus = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadReportsOnStatus = await reportService.getLeadsBasedonStatus(connection);
  if (!leadReportsOnStatus || leadReportsOnStatus.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Leads not found");
  }
  res.send(leadReportsOnStatus);
});

const getCreatedLeadsBasedOnTime = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required');
    }
  
    const connection = await connectionService.getCurrentTenantKnex();
    const leadReportsOnMonth = await reportService.getCreatedLeadsBasedOnTime(connection, new Date(startDate as string), new Date(endDate as string));
  
    if (!leadReportsOnMonth || leadReportsOnMonth.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Leads not found');
    }
  
    res.send(leadReportsOnMonth);
  });

export default {
  getLeadsBasedonStatus,
  getCreatedLeadsBasedOnTime,
};
