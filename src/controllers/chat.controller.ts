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

export default {
  uploadGroupImage,
  getGroupImage,
};
