import { Request, Response } from "express";
import { taskService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boardId = req.params.boardID;
  const task = await taskService.createTask(connection, req.body, req.user?.tenantID, req.user?.id, boardId);
  const message = "Task created successfully.";
  res.status(httpStatus.CREATED).json({ task, message });
});

const getTasksByBoard = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boardId = req.params.boardID;
  console.log("BoardID:", boardId);
  const tasks = await taskService.getTasksByBoard(connection, boardId); 
  res.status(httpStatus.OK).json(tasks);
});

const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const connection = await connectionService.getCurrentTenantKnex();
  const task = await taskService.getTaskById(connection, taskId);
  res.status(httpStatus.OK).json(task);
});

const updateTaskById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const taskId = req.params.taskId;
  const updateTaskData = req.body;
  const updatedTask = await taskService.updateTaskById(
    connection,
    taskId,
    updateTaskData,
  );
  if (updatedTask) {
    res.status(httpStatus.OK).send(updatedTask);
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Task not found" });
  }
});

const deleteTaskById = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  console.log("taskid ", taskId)
  const connection = await connectionService.getCurrentTenantKnex();
  const task = await taskService.deleteTaskById(connection, taskId);
  res.status(httpStatus.NO_CONTENT).json();
});

export default {
  createTask,
  getTasksByBoard,
  getTaskById,
  deleteTaskById,
  updateTaskById,
};
