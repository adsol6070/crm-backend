import { Request, Response } from "express";
import { taskService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createTask = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const task = await taskService.createTask(connection, req.body, req.user?.tenantID);
    const message = "Task created successfully.";
    res.status(httpStatus.CREATED).json({ task, message });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const tasks = await taskService.getTasks(connection);
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
    const connection = await connectionService.getCurrentTenantKnex();
    const task = await taskService.deleteTaskById(connection, taskId);
    res.status(httpStatus.NO_CONTENT).json();
});

export default {
    createTask,
    getTasks,
	getTaskById,
	deleteTaskById,
	updateTaskById,
};
