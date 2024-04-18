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
  );

router
  .route("/:userId")
  .get(auth("getUsers"), connectionRequest, userController.getUser);

export default router;
