import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import initializeUserModel from "../models/user.model";
import logger from "../config/logger";
import { connectionService } from "../services";

const registerUser = catchAsync(async (req, res) => {
  const connection = await connectionService.getConnection();
  const userModel = initializeUserModel(connection);
  logger.info(userModel);
  res.status(httpStatus.CREATED).json({ message: "Ok" });
});

export default { registerUser };
