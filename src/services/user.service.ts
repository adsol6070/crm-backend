import bcrypt from "bcryptjs";
import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import commonService from "./common.service";

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

interface UploadedFile {
  fieldname: string; // Field name specified in the form
  originalname: string; // Original file name on the user's computer
  encoding: string; // Encoding type of the file
  mimetype: string; // Mime type of the file
  destination: string; // Folder to which the file has been saved
  filename: string; // The name of the file within the destination
  path: string; // The full path to the uploaded file
  size: number; // The size of the file in bytes
}

const createUser = async (connection: Knex, user: User, file: UploadedFile) => {
  try {
    if (await commonService.isEmailTaken(connection, user.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    const hashedPassword = await bcrypt.hash(user.password, 8);
    const insertedUser = {
      tenantID: user.tenantID,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      phone: user.phone,
      profileImage: file.filename,
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
    const findedUser = await connection("users").where({ email }).first();
    return findedUser;
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

export default { createUser, getUserByEmail };
