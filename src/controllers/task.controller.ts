import { Request, Response } from "express";
import { taskService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";

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
    req.user?.id,
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

const createTaskColumn = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boardId = req.params.boardID;
  const taskColumn = await taskService.createTaskColumn(connection, req.body, req.user?.tenantID, boardId);
  const message = "Task column created successfully.";
  res.status(httpStatus.CREATED).json({ taskColumn, message });
});

const getTasksColumns = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boardId = req.params.boardID;
  const taskColumns = await taskService.getTaskColumns(connection, boardId);
  res.status(httpStatus.OK).json(taskColumns);
});

const changeTaskOrder = catchAsync(async (req: Request, res: Response) => {
  console.log("Request Body:", req.body);
  const { orderedTasks } = req.body;
  const boardID = req.params.boardId;

  if (!Array.isArray(orderedTasks) || orderedTasks.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ordered tasks data");
  }

  // Ensure each task object contains a valid taskId and order
  orderedTasks.forEach((item: any) => {
    if (!item.taskId || typeof item.order !== "number") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid taskId or order in array",
      );
    }
  });

  const connection = await connectionService.getCurrentTenantKnex();
  const updatedTasks = await taskService.updateTaskOrder(
    connection,
    boardID,
    orderedTasks,
  );

  res
    .status(httpStatus.OK)
    .json({ updatedTasks, message: "Task order updated successfully." });
});

export default {
  createTask,
  getTasksByBoard,
  getTaskById,
  deleteTaskById,
  updateTaskById,
  createTaskColumn,
  getTasksColumns,
  changeTaskOrder,
};
