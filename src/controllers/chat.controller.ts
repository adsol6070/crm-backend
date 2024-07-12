import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import httpStatus from "http-status";
import { chatService, connectionService } from "../services";

const uploadGroupImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "No file uploaded" });
  }
  const imageUrl = req.file.filename;
  res.status(httpStatus.OK).json({ imageUrl });
});

const getGroupImage = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const groupId = req.params.groupId;
  const image = await chatService.getGroupImageById(connection, groupId);
  res.status(httpStatus.OK).sendFile(image);
});

const uploadChatFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "No file uploaded." });
  }

  console.log("Req.file:", req.file);

  const fileUrl = req.file.filename;
  const fileName = req.file.originalname;
  const fileType = req.file.mimetype;
  const fileSize = req.file.size;
  res.status(httpStatus.OK).json({ fileUrl, fileName, fileType, fileSize });
});

const getChatFile = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const { messageId, tenantID, isGroupMessage } = req.body;
  let file;
  if (isGroupMessage) {
    file = await chatService.getGroupChatFileById(
      connection,
      messageId,
      tenantID,
    );
  } else {
    file = await chatService.getChatFileById(connection, messageId, tenantID);
  }
  res.status(httpStatus.OK).sendFile(file);
});

export default {
  uploadGroupImage,
  getGroupImage,
  uploadChatFile,
  getChatFile,
};
