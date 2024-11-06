import express from "express";
import { auth } from "../middlewares/auth";
import { connectionRequest } from "../middlewares/connectionResolver";
import { taskController } from "../controllers";
import { Permission } from "../config/permissions";

const router = express.Router();

router
	.route("/")
	.get(
		auth("Task", Permission.READ),
		connectionRequest,
		taskController.getTasks,
	)
	.post(
		auth("Task", Permission.CREATE),
		connectionRequest,
		taskController.createTask,
	);


router
	.route("/:taskId")
	.get(
		auth("Task", Permission.READ),
		connectionRequest,
		taskController.getTaskById,
	)
	.patch(
		auth("Task", Permission.UPDATE),
		connectionRequest,
		taskController.updateTaskById,
	  )
	.delete(
		auth("Task", Permission.DELETE),
		connectionRequest,
		taskController.deleteTaskById,
	);

export default router;
