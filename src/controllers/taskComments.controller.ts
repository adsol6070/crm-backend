import { Request, Response } from "express";
import { taskCommentService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createTaskComment = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const taskId = req.params.taskID;
  const taskComment = await taskCommentService.createTaskComment(connection, req.body, req.user?.tenantID, req.user?.id, taskId);
  const message = "Task comment created successfully.";
  res.status(httpStatus.CREATED).json({ taskComment, message });
});

const getTaskComments = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const taskId = req.params.taskID;
  const taskComments = await taskCommentService.getTaskComments(connection, taskId); 
  res.status(httpStatus.OK).json(taskComments);
});

const getTaskCommentById = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId;
  const connection = await connectionService.getCurrentTenantKnex();
  const taskComment = await taskCommentService.getTaskCommentById(connection, commentId);
  res.status(httpStatus.OK).json(taskComment);
});

const updateTaskCommentById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const commentId = req.params.commentId;
  const updateTaskCommentData = req.body;
  const updatedTaskComment = await taskCommentService.updateTaskCommentById(
    connection,
    commentId,
    updateTaskCommentData,
  );
  if (updatedTaskComment) {
    res.status(httpStatus.OK).send(updatedTaskComment);
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Task comment not found" });
  }
});

const deleteTaskCommentById = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId;
  const connection = await connectionService.getCurrentTenantKnex();
  const taskComment = await taskCommentService.deleteTaskCommentById(connection, commentId);
  res.status(httpStatus.NO_CONTENT).json();
});

const getAllTaskComments = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const allTaskComments = await taskCommentService.getAllTaskComments(connection); 
  res.status(httpStatus.OK).json(allTaskComments);
});

export default {
  createTaskComment,
  getTaskComments,
  getTaskCommentById,
  updateTaskCommentById,
  deleteTaskCommentById,
  getAllTaskComments,
};
