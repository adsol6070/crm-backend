import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";

const createUser = catchAsync(async (req, res) => {
  const connection = await connectionService.getConnection();
  const uploadFile = req.file as any
  const user = await userService.createUser(connection, req.body, uploadFile);
  res.status(httpStatus.CREATED).json({ user });
});

export default { createUser };
