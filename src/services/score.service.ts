import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Score {
    id?: string;
    name: string;
    email: string;
    phone: string;
    score?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const createScore = async (
    connection: Knex,
    score: Score,
): Promise<Score> => {
    const scoreData: Score = {
        ...score,
        id: uuidv4(),
    };

    const [insertedResult] = await connection("CRSscores")
        .insert(scoreData)
        .returning("*");
    return insertedResult;
};

const getScores = async (connection: Knex): Promise<Score[]> => {
    return await connection("CRSscores").select("*");
};

const getScoreById = async (connection: Knex, scoreId: string): Promise<Score[]> => {
    return await connection("CRSscores").where({id: scoreId}).first();
};

const deleteScoreById = async (
    connection: Knex,
    scoreId: string,
  ): Promise<number> => {
    const deletedCount = await connection("CRSscores").where({ id: scoreId }).delete();
  
    if (deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No score found to delete");
    }
    return deletedCount;
  };

  const deleteAllScores = async (
    connection: Knex,
    userId: string,
  ): Promise<number> => {
    const deletedCount = await connection("CRSscores").where({ tenantID: userId }).delete();
  
    if (deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No score found to delete");
    }
    return deletedCount;
  };

export default {
    createScore,
    getScores,
    getScoreById,
    deleteScoreById,
    deleteAllScores,
};
