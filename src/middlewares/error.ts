import { Request, Response, NextFunction } from "express";
// import mongoose from "mongoose";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import config from "../config/config";
import logger from "../config/logger";

const errorConverter = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let error: any = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode /* || error instanceof mongoose.Error */
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let { statusCode, message } = err;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
