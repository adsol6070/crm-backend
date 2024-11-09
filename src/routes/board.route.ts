import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { boardController } from "../controllers";
import { Permission } from "../config/permissions";

const router = express.Router();

router
	.route("/")
	.get(
		auth("Board", Permission.READ),
		connectionRequest,
		boardController.getBoards,
	)
	.post(
		auth("Board", Permission.CREATE),
		connectionRequest,
		boardController.createBoard,
	)
	.delete(
		auth("Board", Permission.DELETE),
		connectionRequest,
		boardController.deleteBoards,
	);


router
	.route("/:boardID")
	.get(
		auth("Board", Permission.READ),
		connectionRequest,
		boardController.getBoardById,
	)
	.patch(
		auth("Board", Permission.UPDATE),
		connectionRequest,
		boardController.updateBoardById,
	  )
	.delete(
		auth("Board", Permission.DELETE),
		connectionRequest,
		boardController.deleteBoardById,
	);

export default router;
