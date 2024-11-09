import { Request, Response } from "express";
import { boardService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createBoard = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const board = await boardService.createBoard(connection, req.body, req.user?.tenantID, req.user?.id);
  const message = "Board created successfully.";
  res.status(httpStatus.CREATED).json({ board, message });
});

const getBoards = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boards = await boardService.getBoards(connection);
  res.status(httpStatus.OK).json(boards);
});

const getBoardById = catchAsync(async (req: Request, res: Response) => {
  const boardId = req.params.boardID;
  const connection = await connectionService.getCurrentTenantKnex();
  const board = await boardService.getBoardkById(connection, boardId);
  res.status(httpStatus.OK).json(board);
});

const updateBoardById = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const boardId = req.params.boardID;
  const updateBoardData = req.body;
  const updatedBoard = await boardService.updateBoardById(
    connection,
    boardId,
    updateBoardData,
  );
  if (updatedBoard) {
    res.status(httpStatus.OK).send(updatedBoard);
  } else {
    res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Board not found" });
  }
});

const deleteBoardById = catchAsync(async (req: Request, res: Response) => {
  const boardId = req.params.boardID;
  const connection = await connectionService.getCurrentTenantKnex();
  const board = await boardService.deleteBoardById(connection, boardId);
  res.status(httpStatus.NO_CONTENT).json();
});

const deleteBoards = catchAsync(async (req: Request, res: Response) => {
  const connection = await connectionService.getCurrentTenantKnex();
  const board = await boardService.deleteBoards(connection);
  res.status(httpStatus.NO_CONTENT).json();
});

export default {
  createBoard,
  getBoards,
  getBoardById,
  deleteBoardById,
  updateBoardById,
  deleteBoards,
};
