import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id?: string;
  tenantID?: string;
  user_id?: string;
  board_id?: string;
  taskStatus: string;
  taskTitle: string;
  taskDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const createTask = async (
  connection: Knex,
  task: Task,
  tenantID?: string,
  userID?: string,
  boardID?: string,
): Promise<Task> => {
  const taskData: Task = {
    ...task,
    tenantID: tenantID,
    user_id: userID,
    board_id: boardID,
    id: uuidv4(),
  };

  const [insertedResult] = await connection("todoTask")
    .insert(taskData)
    .returning("*");
  return insertedResult;
};

const getTasksByBoard = async (
  connection: Knex,
  boardID: string,
): Promise<Task[]> => {
  return await connection("todoTask").where({ board_id: boardID }).select("*");
};

const getTaskById = async (
  connection: Knex,
  taskId: string,
): Promise<Task[]> => {
  return await connection("todoTask").where({ id: taskId }).first();
};

const updateTaskById = async (
  connection: Knex,
  taskId: string,
  updateTaskData: Partial<Task>,
): Promise<Task> => {
  const updatedTask = await connection("todoTask")
    .where({ id: taskId })
    .update(updateTaskData)
    .returning("*");
  if (updatedTask.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found after update");
  }
  return updatedTask[0];
};

const deleteTaskById = async (
  connection: Knex,
  taskId: string,
): Promise<number> => {
  const deletedCount = await connection("todoTask")
    .where({ id: taskId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No task found to delete");
  }
  return deletedCount;
};

const deleteTasks = async (connection: Knex): Promise<number> => {
  const deletedCount = await connection("todoTask").delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No tasks found to delete");
  }
  return deletedCount;
};

export default {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  deleteTasks,
};
