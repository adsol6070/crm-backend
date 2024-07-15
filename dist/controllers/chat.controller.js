"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const services_1 = require("../services");
const uploadGroupImage = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.file) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ error: "No file uploaded" });
    }
    const imageUrl = req.file.filename;
    res.status(http_status_1.default.OK).json({ imageUrl });
});
const getGroupImage = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const groupId = req.params.groupId;
    const image = await services_1.chatService.getGroupImageById(connection, groupId);
    res.status(http_status_1.default.OK).sendFile(image);
});
const uploadChatFile = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.file) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ error: "No file uploaded." });
    }
    console.log("Req.file:", req.file);
    const fileUrl = req.file.filename;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;
    res.status(http_status_1.default.OK).json({ fileUrl, fileName, fileType, fileSize });
});
const getChatFile = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const { messageId, tenantID, isGroupMessage } = req.body;
    let file;
    if (isGroupMessage) {
        file = await services_1.chatService.getGroupChatFileById(connection, messageId, tenantID);
    }
    else {
        file = await services_1.chatService.getChatFileById(connection, messageId, tenantID);
    }
    res.status(http_status_1.default.OK).sendFile(file);
});
exports.default = {
    uploadGroupImage,
    getGroupImage,
    uploadChatFile,
    getChatFile,
};
