import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { taskCommentController } from "../controllers";
import { Permission } from "../config/permissions";

const router = express.Router();

router
	.route("/")
	.get(
		auth("Task", Permission.READ),
		connectionRequest,
		taskCommentController.getAllTaskComments,
	)

router
	.route("/:taskID")
	.get(
		auth("Task", Permission.READ),
		connectionRequest,
		taskCommentController.getTaskComments,
	)
	.post(
		auth("Task", Permission.CREATE),
		connectionRequest,
		taskCommentController.createTaskComment,
	)

router
	.route("/comment/:commentId")
	.get(
		auth("Task", Permission.READ),
		connectionRequest,
		taskCommentController.getTaskCommentById,
	)
	.patch(
		auth("Task", Permission.UPDATE),
		connectionRequest,
		taskCommentController.updateTaskCommentById,
	)
	.delete(
		auth("Task", Permission.DELETE),
		connectionRequest,
		taskCommentController.deleteTaskCommentById,
	);

export default router;
