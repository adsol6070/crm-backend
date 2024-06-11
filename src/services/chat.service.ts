import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import fs from "fs";

const getGroupImageById = async (connection: Knex, groupId: string) => {
  const group = await connection("groups").where({ id: groupId }).first();
  if (!group) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Group not found");
  }
  const image = path.join(
    __dirname,
    "..",
    "uploads",
    group.tenantID as string,
    "ChatGroupImages",
    group.image,
  );
  return image;
};

const getGroupById = async (connection: Knex, groupId: string) => {
  const group = await connection("groups").where({ id: groupId }).first();
  if (!group) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Group not found");
  }
  return group;
};

const deleteGroupImage = async (tenantID: string, image: string) => {
  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    tenantID,
    "ChatGroupImages",
    image,
  );

  if (!fs.existsSync(filePath)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group Image File Path not found");
  }

  fs.unlinkSync(filePath);
};

export default {
  getGroupImageById,
  getGroupById,
  deleteGroupImage,
};
