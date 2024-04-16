import bcrypt from "bcryptjs";
import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

interface DatabaseError extends Error {
  code?: string;
}

interface User {
  tenantID: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  profileImage: string;
  isEmailVerified: boolean;
  role: string;
}

const createUser = async (connection: Knex, user: User) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 8);
    const insertedUser = {
      tenantID: user.tenantID,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      phone: user.phone,
      profileImage: user.profileImage,
      isEmailVerified: false,
      role: user.role,
    };

    await connection("users").insert(insertedUser);
    return insertedUser;
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getUserByEmail = async (
  connection: Knex,
  email: string,
): Promise<any> => {
  try {
    return await connection("users").where({ email }).first();
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

export default { createUser, getUserByEmail };
