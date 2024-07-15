"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const createScore = async (connection, score) => {
    const scoreData = {
        ...score,
        id: (0, uuid_1.v4)(),
    };
    const [insertedResult] = await connection("CRSscores")
        .insert(scoreData)
        .returning("*");
    return insertedResult;
};
const getScores = async (connection) => {
    return await connection("CRSscores").select("*");
};
const getScoreById = async (connection, scoreId) => {
    return await connection("CRSscores").where({ id: scoreId }).first();
};
const deleteScoreById = async (connection, scoreId) => {
    const deletedCount = await connection("CRSscores").where({ id: scoreId }).delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No score found to delete");
    }
    return deletedCount;
};
const deleteAllScores = async (connection, userId) => {
    const deletedCount = await connection("CRSscores").where({ tenantID: userId }).delete();
    if (deletedCount === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No score found to delete");
    }
    return deletedCount;
};
exports.default = {
    createScore,
    getScores,
    getScoreById,
    deleteScoreById,
    deleteAllScores,
};
