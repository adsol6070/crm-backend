import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";

interface Task {
  id?: string;
  tenantID?: string;
  user_id?: string;
  board_id?: string;
  columnId: string;
  taskStatus: string;
  taskTitle: string;
  taskHistory: string;
  taskDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskColumn {
  id?: string;
  tenantID?: string;
  board_id?: string;
  taskStatus?:  { name: string }[];
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
  const taskHistoryEntry = {
    action: "Created",
    timestamp: new Date().toISOString(),
    details: { user: {userid: userID}, status: {addedStatus: task.taskStatus} },
  };

  const taskData: Task = {
    ...task,
    tenantID: tenantID,
    user_id: userID,
    board_id: boardID,
    id: uuidv4(),
    taskHistory: JSON.stringify([taskHistoryEntry])
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
  const data = await connection("todoTask").where({ board_id: boardID }).select("*");
  const users = await connection("users").select(
    "id",
    "firstname",
    "lastname",
  );

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = {
      firstname: capitalizeFirstLetter(user.firstname),
      lastname: capitalizeFirstLetter(user.lastname),
    };
    return acc;
  }, {} as Record<string, { firstname: string; lastname: string }>);

  const updatedTasks = data.map((task) => {
    const updatedHistory = task.taskHistory.map((history: any) => {
      const userId = history.details.user.userid;
      const userDetails = userMap[userId] || { firstname: null, lastname: null };

      return {
        ...history,
        details: {
          ...history.details,
          user: {
            ...history.details.user,
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
          },
        },
      };
    });

    return {
      ...task,
      taskHistory: updatedHistory,
    };
  });

  return updatedTasks;
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
  userID?: string
): Promise<Task> => {
  const task = await connection("todoTask").where({ id: taskId }).first();
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  let taskHistory: Array<{ action: string; timestamp: string; details?: any }> = [];
  if (task.taskHistory) {
    if (typeof task.taskHistory === "string") {
      taskHistory = JSON.parse(task.taskHistory);
    } else {
      taskHistory = task.taskHistory;
    }
  }

  const isStatusUpdated = updateTaskData.taskStatus !== undefined;

  taskHistory.push({
    action: "Updated",
    timestamp: new Date().toISOString(),
    details: {
      user: { userid: userID },
      ...(isStatusUpdated && {
        status: {
          prevStatus: task.taskStatus,
          upcomingStatus: updateTaskData.taskStatus,
        },
      }),
    },
  });

  const updates = Object.entries(updateTaskData).reduce<Partial<Task>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof Task] = value as any;
      }
      return acc;
    },
    {} as Partial<Task>
  );

  const updatedDataWithHistory = {
    ...updates,
    taskHistory: JSON.stringify(taskHistory),
  };

  const updatedTask = await connection("todoTask")
    .where({ id: taskId })
    .update(updatedDataWithHistory)
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

const createTaskColumn = async (
  connection: Knex,
  taskColumn: {id: string; name: string }[],
  tenantID?: string,
  boardID?: string
): Promise<TaskColumn[]> => {
  const existingRow = await connection("todoTaskColumn")
    .where("board_id", boardID)
    .first();

  if (existingRow) {
    const existingTaskStatus = existingRow.taskStatus || [];
const taskColumns = [taskColumn]
    const updatedTaskStatus = [...existingTaskStatus, ...taskColumns];

    const [updatedResult] = await connection("todoTaskColumn")
      .where("board_id", boardID)
      .update({taskStatus: JSON.stringify(updatedTaskStatus)})
      .returning("*");

    return updatedResult;
  } else {

    const taskColumnData: any = {
      taskStatus: JSON.stringify(Array.of(taskColumn)),
      tenantID: tenantID,
      board_id: boardID,
      id: uuidv4(),
    };

    const [insertedResult] = await connection("todoTaskColumn")
      .insert(taskColumnData)
      .returning("*");

    return insertedResult;
  }
};

const getTaskColumns = async (
  connection: Knex,
  boardID: string,
): Promise<TaskColumn[]> => {
  return await connection("todoTaskColumn").where({ board_id: boardID }).select("*");
};

const updateTaskOrder = async (
  connection: Knex,
  boardId: string, 
  orderedTasks: { taskId: string; order: number }[],
): Promise<Task[]> => {
  const updatedTasks: Task[] = [];

  for (let i = 0; i < orderedTasks.length; i++) {
    const { taskId, order } = orderedTasks[i];
    const updatedTask = await connection("todoTask")
      .where({ id: taskId, boardId })
      .update({ order })
      .returning("*");

    if (updatedTask.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Task with ID ${taskId} not found`,
      );
    }

    updatedTasks.push(updatedTask[0]);
  }

  return updatedTasks;
};

export default {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  createTaskColumn,
  getTaskColumns,
  updateTaskOrder,
};
