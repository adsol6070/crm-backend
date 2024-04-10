import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import { userService } from "../services";

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

export default { register };
