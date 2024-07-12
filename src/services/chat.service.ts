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

const getChatFileById = async (
  connection: Knex,
  messageId: string,
  tenantID: string,
) => {
  const message = await connection("messages").where({ id: messageId }).first();
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
  }
  const file = path.join(
    __dirname,
    "..",
    "uploads",
    tenantID as string,
    "ChatMessageFiles",
    message.file_url,
  );
  return file;
};

const getGroupChatFileById = async (
  connection: Knex,
  messageId: string,
  tenantID: string,
) => {
  const message = await connection("group_messages")
    .where({ id: messageId })
    .first();
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, "Message not found");
  }
  const file = path.join(
    __dirname,
    "..",
    "uploads",
    tenantID as string,
    "ChatMessageFiles",
    message.file_url,
  );
  return file;
};

const deleteChatFile = async (tenantID: string, file: string) => {
  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    tenantID as string,
    "ChatMessageFiles",
    file,
  );

  if (!fs.existsSync(filePath)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat file not found");
  }

  fs.unlinkSync(filePath);
};

export default {
  getGroupImageById,
  getGroupById,
  deleteGroupImage,
  getChatFileById,
  getGroupChatFileById,
  deleteChatFile,
};
