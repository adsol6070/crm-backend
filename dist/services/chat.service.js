"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getGroupImageById = async (connection, groupId) => {
    const group = await connection("groups").where({ id: groupId }).first();
    if (!group) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Group not found");
    }
    const image = path_1.default.join(__dirname, "..", "uploads", group.tenantID, "ChatGroupImages", group.image);
    return image;
};
const getGroupById = async (connection, groupId) => {
    const group = await connection("groups").where({ id: groupId }).first();
    if (!group) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Group not found");
    }
    return group;
};
const deleteGroupImage = async (tenantID, image) => {
    const filePath = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatGroupImages", image);
    if (!fs_1.default.existsSync(filePath)) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Group Image File Path not found");
    }
    fs_1.default.unlinkSync(filePath);
};
const getChatFileById = async (connection, messageId, tenantID) => {
    const message = await connection("messages").where({ id: messageId }).first();
    if (!message) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Message not found");
    }
    const file = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatMessageFiles", message.file_url);
    return file;
};
const getGroupChatFileById = async (connection, messageId, tenantID) => {
    const message = await connection("group_messages")
        .where({ id: messageId })
        .first();
    if (!message) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Message not found");
    }
    const file = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatMessageFiles", message.file_url);
    return file;
};
const deleteChatFile = async (tenantID, file) => {
    const filePath = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatMessageFiles", file);
    if (!fs_1.default.existsSync(filePath)) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Chat file not found");
    }
    fs_1.default.unlinkSync(filePath);
};
exports.default = {
    getGroupImageById,
    getGroupById,
    deleteGroupImage,
    getChatFileById,
    getGroupChatFileById,
    deleteChatFile,
};
