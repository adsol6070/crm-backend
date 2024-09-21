import bcrypt from "bcryptjs";
import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import commonService from "./common.service";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { commonKnex } from "../config/database";

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
  city: string;
  address: string;
  uploadType?: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  role?: string;
  last_active?: string;
}

type SafeUser = Omit<User, "password" | "created_at" | "updated_at">;

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

const getUserProfile = async (
  connection: Knex,
  userId: string,
): Promise<SafeUser> => {
  const user = await connection("users")
    .select(
      "id",
      "tenantID",
      "firstname",
      "lastname",
      "email",
      "phone",
      "city",
      "address",
      "profileImage",
      "isEmailVerified",
      "role",
      "online",
    )
    .where({ id: userId })
    .first();

  if (user) {
    user.profileImageUrl = getUserImageUrl(user.profileImage, user.tenantID);
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const createUser = async (
  connection: Knex,
  user: User,
  file?: UploadedFile,
  tenantID?: string,
) => {
  try {
    if (await commonService.isEmailTaken(connection, "users", user.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    const hashedPassword = await bcrypt.hash(user.password, 8);
    const id = uuidv4();
    const insertedUser = {
      id: id,
      tenantID: user.tenantID ?? tenantID,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: hashedPassword,
      phone: user.phone,
      city: user.city,
      address: user.address,
      profileImage: file ? file.filename : null,
      isEmailVerified: user.isEmailVerified ?? false,
      role: user.role ?? "user",
    };
    const commonUser = {
      id: id,
      tenantID: user.tenantID ?? tenantID,
      email: user.email,
    };

    await connection("users").insert(insertedUser);
    await commonKnex("users").insert(commonUser);
    return insertedUser;
  } catch (error: DatabaseError | any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getUserByID = async (connection: Knex, id: string): Promise<any> => {
  const user = await connection("users").where({ id }).first();
  if (user) {
    user.profileImageUrl = getUserImageUrl(user.profileImage, user.tenantID);
  }
  return user;
};

const getUserImageById = async (connection: Knex, id: string) => {
  const user = await connection("users").where({ id }).first();
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const image = path.join(
    __dirname,
    "..",
    "uploads",
    user.tenantID as string,
    "User",
    user.profileImage,
  );
  return image;
};

const getUserByEmail = async (
  connection: Knex,
  email: string,
): Promise<any> => {
  return await connection("users").where({ email }).first();
};

const getUserImageUrl = (
  profileImage: string | undefined,
  tenantID: string | undefined,
): string => {
  if (!profileImage || !tenantID) return "";
  const baseUrl = "http://192.168.1.12:8000/uploads";
  return `${baseUrl}/${tenantID}/User/${profileImage}`;
};

const getAllUsers = async (connection: Knex): Promise<SafeUser[]> => {
  const users = await connection<SafeUser>("users").select(
    "id",
    "tenantID",
    "firstname",
    "lastname",
    "email",
    "phone",
    "city",
    "address",
    "profileImage",
    "isEmailVerified",
    "role",
  );
  return users.map((user) => ({
    ...user,
    profileImageUrl: getUserImageUrl(user.profileImage, user.tenantID),
  }));
};

const updateUserById = async (
  connection: Knex,
  userId: string,
  updateBody: Partial<User>,
  file?: UploadedFile,
) => {
  const { uploadType, last_active, ...filteredUpdateBody } = updateBody;
  const user = await getUserByID(connection, userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (filteredUpdateBody.password) {
    filteredUpdateBody.password = await bcrypt.hash(
      filteredUpdateBody.password,
      8,
    );
  }

  if (file) {
    filteredUpdateBody.profileImage = file.filename;
  }

  const updates = Object.entries(filteredUpdateBody).reduce<Partial<User>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        const userKey: keyof User = key as keyof User;
        acc[userKey] = value as any;
      }
      return acc;
    },
    {} as Partial<User>,
  );

  const updatedUser = await connection("users")
    .where({ id: userId })
    .update(updates)
    .returning("*");

  if (updates.email && updates.tenantID) {
    const commonUpdates = {
      email: updates.email,
      tenantID: updates.tenantID,
    };

    await commonKnex("users")
      .where({ id: userId })
      .update(commonUpdates)
      .returning("*");
  }

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
  await commonKnex("users").where({ id: userId }).delete();
  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No user found to delete");
  }
  return deletedCount;
};

const deleteUsersByIds = async (connection: Knex, userIds: string[]) => {
  if (userIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No user IDs provided");
  }

  const deletedCount = await connection("users")
    .whereIn("id", userIds)
    .delete();

  await commonKnex("users").whereIn("id", userIds).delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found to delete");
  }
};

const deleteAllUsers = async (connection: Knex) => {
  const deletedCount = await connection("users").del();
  await commonKnex("users").del();
  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found to delete");
  }
  return deletedCount;
};

export default {
  getUserProfile,
  createUser,
  getUserByID,
  getUserImageById,
  getAllUsers,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  deleteUsersByIds,
  deleteAllUsers,
};
