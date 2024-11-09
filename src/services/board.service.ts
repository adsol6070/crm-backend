import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Board {
	id?: string;
	tenantID?: string;
	user_id?: string;
	boardTitle: string;
	boardDescription: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const createBoard = async (
	connection: Knex,
	board: Board,
	tenantID?: string,
	userID?: string,
): Promise<Board> => {
	const boardData: Board = {
		...board,
		tenantID: tenantID,
		user_id: userID,
		id: uuidv4(),
	};

	const [insertedResult] = await connection("todoBoard")
		.insert(boardData)
		.returning("*");
	return insertedResult;
};

const getBoards = async (connection: Knex): Promise<Board[]> => {
	return await connection("todoBoard").select("*");
};

const getBoardkById = async (
	connection: Knex,
	boardId: string,
): Promise<Board[]> => {
	return await connection("todoBoard").where({ id: boardId }).first();
};

const updateBoardById = async (
	connection: Knex,
	boardId: string,
	updateBoardData: Partial<Board>,
  ): Promise<Board> => {
	const updatedBoard = await connection("todoBoard")
	  .where({ id: boardId })
	  .update(updateBoardData)
	  .returning("*");
	if (updatedBoard.length === 0) {
	  throw new ApiError(
		httpStatus.NOT_FOUND,
		"board not found after update",
	  );
	}
	return updatedBoard[0];
  };

const deleteBoardById = async (
	connection: Knex,
	boardId: string,
): Promise<number> => {
	const deletedCount = await connection("todoBoard")
		.where({ id: boardId })
		.delete();

	if (deletedCount === 0) {
		throw new ApiError(httpStatus.NOT_FOUND, "No board found to delete");
	}
	return deletedCount;
};

const deleteBoards = async (
	connection: Knex,
): Promise<number> => {
	const deletedCount = await connection("todoBoard").delete();

	if (deletedCount === 0) {
		throw new ApiError(httpStatus.NOT_FOUND, "No boards found to delete");
	}
	return deletedCount;
};

export default {
	createBoard,
	getBoards,
	getBoardkById,
	updateBoardById,
	deleteBoardById,
	deleteBoards,
};
