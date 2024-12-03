import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";

interface TaskComment {
  id?: string;
  tenantID?: string;
  author_id?: string;
  task_id?: string;
  is_edited?: boolean;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const createTaskComment = async (
  connection: Knex,
  taskComment: TaskComment,
  tenantID?: string,
  userID?: string,
  taskID?: string,
): Promise<TaskComment> => {
  const taskCommentData: TaskComment = {
    ...taskComment,
    tenantID: tenantID,
    author_id: userID,
    task_id: taskID,
    id: uuidv4(),
  };

  const [insertedResult] = await connection("taskComments")
    .insert(taskCommentData)
    .returning("*");
  return insertedResult;
};

const getTaskComments = async (
  connection: Knex,
  taskID: string,
): Promise<TaskComment[]> => {
  const data = await connection("taskComments").where({ task_id: taskID }).orderBy("created_at", "desc").select("*");

  const users = await connection("users").select(
    "id",
    "firstname",
    "lastname",
  );

  const mergedData = data.map((comment) => {
    const user = users.find((user) => user.id === comment.author_id);
    return {
      ...comment,
      author: user ? { firstname: capitalizeFirstLetter(user.firstname), lastname: capitalizeFirstLetter(user.lastname) } : null,
    };
  });

  return mergedData
};

const getTaskCommentById = async (
  connection: Knex,
  commentId: string,
): Promise<TaskComment[]> => {
  return await connection("taskComments").where({ id: commentId }).first();
};

const updateTaskCommentById = async (
  connection: Knex,
  commentId: string,
  updateTaskCommentData: Partial<TaskComment>,
): Promise<TaskComment> => {
  const updatedData = {
    ...updateTaskCommentData,
    is_edited: true
  }
  const updatedTaskComment = await connection("taskComments")
    .where({ id: commentId })
    .update(updatedData)
    .returning("*");
  if (updatedTaskComment.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task comment not found after update");
  }
  return updatedTaskComment[0];
};

const deleteTaskCommentById = async (
  connection: Knex,
  commentId: string,
): Promise<number> => {
  const deletedCount = await connection("taskComments")
    .where({ id: commentId })
    .delete();

  if (deletedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No task comment found to delete");
  }
  return deletedCount;
};

const getAllTaskComments = async (
  connection: Knex,
): Promise<TaskComment[]> => {
  const data = await connection("taskComments").orderBy("created_at", "desc").select("*");

  const users = await connection("users").select(
    "id",
    "firstname",
    "lastname",
  );

  const mergedData = data.map((comment) => {
    const user = users.find((user) => user.id === comment.author_id);
    return {
      ...comment,
      author: user ? { firstname: capitalizeFirstLetter(user.firstname), lastname: capitalizeFirstLetter(user.lastname) } : null,
    };
  });

  return mergedData
};

export default {
  createTaskComment,
  getTaskComments,
  getTaskCommentById,
  updateTaskCommentById,
  deleteTaskCommentById,
  getAllTaskComments,
};
