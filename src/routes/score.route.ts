import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { scoreController } from "../controllers";
import { Permission } from "../config/permissions";

const router = express.Router();

router
  .route("/")
  .get(
    auth("Scores", Permission.READ),
    connectionRequest,
    scoreController.getScores,
  )
  .post(
    auth("Scores", Permission.CREATE),
    connectionRequest,
    scoreController.createScore,
  );

  router
  .route("/deleteSelectedScores")
  .post(
    auth("Scores", Permission.DELETESELECTED),
    connectionRequest,
    scoreController.deleteSelectedScore,
  );

router
  .route("/:scoreId")
  .get(
    auth("Scores", Permission.READ),
    connectionRequest,
    scoreController.getScoreById,
  )
  .delete(
    auth("Scores", Permission.DELETE),
    connectionRequest,
    scoreController.deleteScoreById,
  );

  router
  .route("/deleteAll/:userId")
  .delete(
    auth("Scores", Permission.DELETE),
    connectionRequest,
    scoreController.deleteAllScores,
  );

export default router;
