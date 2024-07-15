"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionResolver_1 = require("../middlewares/connectionResolver");
const controllers_1 = require("../controllers");
const multer_1 = __importDefault(require("../middlewares/multer"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router
    .route("/groupImage")
    .post((0, auth_1.auth)(), multer_1.default.single("groupImage"), connectionResolver_1.connectionRequest, controllers_1.chatController.uploadGroupImage);
router
    .route("/groupImage/:groupId")
    .get((0, auth_1.auth)(), connectionResolver_1.connectionRequest, controllers_1.chatController.getGroupImage);
router
    .route("/uploadChatFile")
    .post((0, auth_1.auth)(), multer_1.default.single("chatFile"), connectionResolver_1.connectionRequest, controllers_1.chatController.uploadChatFile);
router
    .route("/getChatFile")
    .post((0, auth_1.auth)(), connectionResolver_1.connectionRequest, controllers_1.chatController.getChatFile);
exports.default = router;
