import { Request, Response } from "express";
import { scoreService, connectionService } from "../services";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";

const createScore = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const score = await scoreService.createScore(connection, req.body);
    const message = "Score saved successfully.";
    res.status(httpStatus.CREATED).json({ score, message });
});

const getScores = catchAsync(async (req: Request, res: Response) => {
    const connection = await connectionService.getCurrentTenantKnex();
    const scores = await scoreService.getScores(connection);
    res.status(httpStatus.OK).json(scores);
});

const getScoreById = catchAsync(async (req: Request, res: Response) => {
    const scoreId = req.params.scoreId;
    const connection = await connectionService.getCurrentTenantKnex();
    const score = await scoreService.getScoreById(connection, scoreId);
    res.status(httpStatus.OK).json(score);
});

const deleteScoreById = catchAsync(async (req: Request, res: Response) => {
    const scoreId = req.params.scoreId;
    const connection = await connectionService.getCurrentTenantKnex();
    const score = await scoreService.deleteScoreById(connection, scoreId);
    res.status(httpStatus.NO_CONTENT).json();
});

const deleteAllScores = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    console.log("user id in delete all", userId)
    const connection = await connectionService.getCurrentTenantKnex();
    const scores = await scoreService.deleteAllScores(connection, userId);
    res.status(httpStatus.NO_CONTENT).json();
});

export default {
    createScore,
    getScores,
    getScoreById,
    deleteScoreById,
    deleteAllScores,
};
