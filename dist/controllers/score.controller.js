"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const createScore = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const score = await services_1.scoreService.createScore(connection, req.body);
    const message = "Score saved successfully.";
    res.status(http_status_1.default.CREATED).json({ score, message });
});
const getScores = (0, catchAsync_1.default)(async (req, res) => {
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const scores = await services_1.scoreService.getScores(connection);
    res.status(http_status_1.default.OK).json(scores);
});
const getScoreById = (0, catchAsync_1.default)(async (req, res) => {
    const scoreId = req.params.scoreId;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const score = await services_1.scoreService.getScoreById(connection, scoreId);
    res.status(http_status_1.default.OK).json(score);
});
const deleteScoreById = (0, catchAsync_1.default)(async (req, res) => {
    const scoreId = req.params.scoreId;
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const score = await services_1.scoreService.deleteScoreById(connection, scoreId);
    res.status(http_status_1.default.NO_CONTENT).json();
});
const deleteAllScores = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.params.userId;
    console.log("user id in delete all", userId);
    const connection = await services_1.connectionService.getCurrentTenantKnex();
    const scores = await services_1.scoreService.deleteAllScores(connection, userId);
    res.status(http_status_1.default.NO_CONTENT).json();
});
exports.default = {
    createScore,
    getScores,
    getScoreById,
    deleteScoreById,
    deleteAllScores,
};
