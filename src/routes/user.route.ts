import express from "express";
import { auth } from "../middlewares/auth";
import { userController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";
import { Permission } from "../config/permissions";

const router = express.Router();

router
  .route("/")
  .post(
    auth("Users", Permission.CREATE),
    upload.single("profileImage"),
    connectionRequest,
    userController.createUser,
  )
  .get(
    auth("Users", Permission.READ),
    connectionRequest,
    userController.getUsers,
  );

router
  .route("/:userId")
  .get(
    auth("Users", Permission.READ),
    connectionRequest,
    userController.getUser,
  )
  .patch(
    auth("Users", Permission.UPDATE),
    upload.single("profileImage"),
    connectionRequest,
    userController.updateUser,
  )
  .delete(
    auth("Users", Permission.DELETE),
    connectionRequest,
    userController.deleteUser,
  );

router.get(
  "/:userId/image",
  auth("Users", Permission.READ),
  connectionRequest,
  userController.getUserImage,
);

export default router;
