import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { connectionService, userService } from "../services";

const createUser = catchAsync(async (req, res) => {
  const connection = await connectionService.getConnection();
  const user = await userService.createUser(connection, req.body);
  res.status(httpStatus.CREATED).json({ user });
});

export default { createUser };
