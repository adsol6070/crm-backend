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
  res.status(httpStatus.OK).send(leadReportsOnStatus);
});

const getCreatedLeadsBasedOnTime = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(httpStatus.BAD_REQUEST).send("Not Available");
  }

  const connection = await connectionService.getCurrentTenantKnex();
  const leadReportsOnMonth = await reportService.getCreatedLeadsBasedOnTime(connection, new Date(startDate as string), new Date(endDate as string));

  if (!leadReportsOnMonth || leadReportsOnMonth.length === 0) {
    res.status(httpStatus.BAD_REQUEST).send("Not Available");
  }

  res.status(httpStatus.OK).send(leadReportsOnMonth);
});

const getCreatedLeadsBasedOnSource = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const leadReportsOnSource = await reportService.getCreatedLeadsBasedOnSource(connection);
  if (!leadReportsOnSource || leadReportsOnSource.length === 0) {
    res.status(httpStatus.BAD_REQUEST).send("Not Available");
  }
  res.status(httpStatus.OK).send(leadReportsOnSource);
});

export default {
  getLeadsBasedonStatus,
  getCreatedLeadsBasedOnTime,
  getCreatedLeadsBasedOnSource,
};
