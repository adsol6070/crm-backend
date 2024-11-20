import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { boardController } from "../controllers";
import { Permission } from "../config/permissions";

const router = express.Router();

router
  .route("/")
  .get(
    auth("Task", Permission.READ),
    connectionRequest,
    boardController.getBoards,
  )
  .post(
    auth("Task", Permission.CREATE),
    connectionRequest,
    boardController.createBoard,
  )
  .delete(
    auth("Task", Permission.DELETE),
    connectionRequest,
    boardController.deleteBoards,
  );

router.patch(
  "/order",
  auth(),
  connectionRequest,
  boardController.changeBoardOrder,
);

router
  .route("/:boardID")
  .get(
    auth("Task", Permission.READ),
    connectionRequest,
    boardController.getBoardById,
  )
  .patch(
    auth("Task", Permission.UPDATE),
    connectionRequest,
    boardController.updateBoardById,
  )
  .delete(
    auth("Task", Permission.DELETE),
    connectionRequest,
    boardController.deleteBoardById,
  );

export default router;
