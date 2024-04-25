import express from "express";
import { auth } from "../middlewares/auth";
import { userController } from "../controllers";
import { connectionRequest } from "../middlewares/connectionResolver";
import upload from "../middlewares/multer";

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageUsers"),
    upload.single("profileImage"),
    connectionRequest,
    userController.createUser,
  )
  .get(auth("getUsers"), connectionRequest, userController.getUsers);

router
  .route("/:userId")
  .get(auth("getUsers"), connectionRequest, userController.getUser)
  .patch(
    auth("manageUsers"),
    upload.single("profileImage"),
    connectionRequest,
    userController.updateUser,
  )
  .delete(auth("manageUsers"), connectionRequest, userController.deleteUser);

router.get(
  "/:userId/image",
  auth("getUsers"),
  connectionRequest,
  userController.getUserImage,
);

export default router;
