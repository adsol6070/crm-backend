import bcrypt from "bcryptjs";
import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import commonService from "./common.service";

interface DatabaseError extends Error {
  code?: string;
}

interface User {
  id?: string;
  tenantID?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  role?: string;
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

const createUser = async (
  connection: Knex,
  user: User,
  file?: UploadedFile,
  tenantID?: string,
) => {
  try {
    if (await commonService.isEmailTaken(connection, user.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    const hashedPassword = await bcrypt.hash(user.password, 8);
    const insertedUser = {
      tenantID: user.tenantID ?? tenantID,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      phone: user.phone,
      profileImage: file ? file.filename : null,
      isEmailVerified: user.isEmailVerified ?? false,
      role: user.role ?? "user",
    };

    await connection("users").insert(insertedUser);
    return insertedUser;
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getUserByID = async (connection: Knex, id: string): Promise<any> => {
  return await connection("users").where({ id }).first();
};

const getUserByEmail = async (
  connection: Knex,
  email: string,
): Promise<any> => {
  return await connection("users").where({ email }).first();
};

const updateUserById = async (
  connection: Knex,
  userId: string,
  updateBody: Partial<User>,
  file?: UploadedFile,
) => {
  const user = await getUserByID(connection, userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (
    updateBody.email &&
    (await commonService.isEmailTaken(connection, updateBody.email))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  if (updateBody.password) {
    updateBody.password = await bcrypt.hash(user.password, 8);
  }

  if (file) {
    updateBody.profileImage = file.filename;
  }

  const updates = Object.entries(updateBody).reduce<Partial<User>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        const userKey: keyof User = key as keyof User;
        acc[userKey] = value as any; // Ensure the key is a valid keyof User
      }
      return acc;
    },
    {} as Partial<User>,
  );

  const updatedUser = await connection("users")
    .where({ id: userId })
    .update(updates)
    .returning("*");

  if (updatedUser.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found after update");
  }
  return updatedUser[0];
};

const deleteUserById = async (connection: Knex, userId: string) => {
  const user = await getUserByID(connection, userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const deletedCount = await connection("users").where({ id: userId }).delete();
  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No user found to delete");
  }
  return deletedCount;
};

export default {
  createUser,
  getUserByID,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
