import express, { NextFunction, Request, Response } from "express";
import { connectionRequest } from "../middlewares/connectionResolver";
import { chatController } from "../controllers";
import upload from "../middlewares/multer";
import { auth } from "../middlewares/auth";

const router = express.Router();

router
  .route("/groupImage")
  .post(
    auth(),
    upload.single("groupImage"),
    connectionRequest,
    chatController.uploadGroupImage,
  );

router
  .route("/groupImage/:groupId")
  .get(auth(), connectionRequest, chatController.getGroupImage);

router
  .route("/uploadChatFile")
  .post(
    auth(),
    upload.single("chatFile"),
    connectionRequest,
    chatController.uploadChatFile,
  );

router
  .route("/getChatFile")
  .post(auth(), connectionRequest, chatController.getChatFile);

export default router;
