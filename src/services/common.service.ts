import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";

interface DatabaseError extends Error {
  code?: string;
}

const isEmailTaken = async (
  connection: Knex,
  email: string,
  excludeUserId?: string,
): Promise<boolean> => {
  try {
    const user = await connection("users")
      .where({ email })
      .andWhereNot("id", excludeUserId)
      .first();

    return !!user;
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const isPasswordMatch = (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export default { isEmailTaken, isPasswordMatch };
