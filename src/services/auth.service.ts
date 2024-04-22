import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import commonService from "./common.service";

const loginWithEmailAndPassword = async (
  connection: Knex,
  email: string,
  password: string,
) => {
  const user = await connection("users").where({ email }).first();
  if (
    !user ||
    !(await commonService.isPasswordMatch(password, user.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

export default {
  loginWithEmailAndPassword,
};
